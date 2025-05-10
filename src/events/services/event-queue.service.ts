import { Injectable, OnModuleInit, Inject, forwardRef } from "@nestjs/common";
import { Queue, Worker, Job } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { EventsService } from "./events.service";
import { WebhookService } from "./webhook.service";
import { LoggingService } from "../../logging/logging.service";
import { EventStatus } from "../enums/event-status.enum";
import Redis from "ioredis";

@Injectable()
export class EventQueueService implements OnModuleInit {
  private eventQueue: Queue;
  private eventWorker: Worker;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly webhookService: WebhookService,
    private readonly loggingService: LoggingService
  ) {
    const connection = new Redis({
      host: this.configService.get("REDIS_HOST", "localhost"),
      port: this.configService.get("REDIS_PORT", 6379),
    });

    this.eventQueue = new Queue("events", { connection });
  }

  async onModuleInit() {
    this.eventWorker = new Worker(
      "events",
      async (job: Job) => {
        const { eventLogId } = job.data;
        try {
          const eventLog = await this.eventsService.findEventLog(eventLogId);
          const eventDefinition = await this.eventsService.findEventDefinition(eventLog.eventDefinition.id);

          // Update status to processing
          await this.eventsService.updateEventLogStatus(eventLogId, EventStatus.PROCESSING);

          // Process triggers
          if (eventDefinition.triggers?.length) {
            for (const trigger of eventDefinition.triggers) {
              if (trigger.isActive) {
                await this.eventsService.processTrigger(trigger, eventLog.payload);
              }
            }
          }

          // Process webhooks
          if (eventDefinition.webhooks?.length) {
            for (const webhook of eventDefinition.webhooks) {
              if (webhook.isActive) {
                await this.webhookService.sendWebhook(webhook, eventLog.payload);
              }
            }
          }

          // Mark as completed
          await this.eventsService.updateEventLogStatus(eventLogId, EventStatus.COMPLETED, null, new Date());
        } catch (error) {
          const eventLog = await this.eventsService.findEventLog(eventLogId);
          const shouldRetry = eventLog.retryCount < eventLog.eventDefinition.maxRetries;

          if (shouldRetry) {
            await this.eventsService.updateEventLogStatus(eventLogId, EventStatus.RETRYING, error.message);
            throw error; // This will trigger a retry
          } else {
            await this.eventsService.updateEventLogStatus(eventLogId, EventStatus.FAILED, error.message, new Date());
          }
        }
      },
      {
        connection: this.eventQueue.opts.connection,
        concurrency: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );

    this.eventWorker.on("completed", async (job) => {
      await this.loggingService.logRequest({
        method: "EVENT",
        url: `Event processed: ${job.data.eventLogId}`,
        statusCode: 200,
      });
    });

    this.eventWorker.on("failed", async (job, error) => {
      await this.loggingService.logRequest({
        method: "EVENT",
        url: `Event failed: ${job?.data.eventLogId}`,
        statusCode: 500,
        body: { error: error.message },
      });
    });
  }

  async addToQueue(eventLogId: string, delay = 0): Promise<void> {
    await this.eventQueue.add(
      "process-event",
      { eventLogId },
      {
        delay,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );
  }
}
