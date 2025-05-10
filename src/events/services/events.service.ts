import { Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventDefinition } from "../entities/event-definition.entity";
import { EventLog } from "../entities/event-log.entity";
import { EventTrigger } from "../entities/event-trigger.entity";
import { CreateEventDefinitionDto } from "../dto/create-event-definition.dto";
import { CreateEventTriggerDto } from "../dto/create-event-trigger.dto";
import { EventStatus } from "../enums/event-status.enum";
import { EventType } from "../enums/event-type.enum";
import { CollectionService } from "../../collections/services/collection.service";
import { EventQueueService } from "./event-queue.service";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventDefinition)
    private readonly eventDefinitionRepository: Repository<EventDefinition>,
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    @InjectRepository(EventTrigger)
    private readonly eventTriggerRepository: Repository<EventTrigger>,
    private readonly collectionService: CollectionService,
    @Inject(forwardRef(() => EventQueueService)) private readonly eventQueueService: EventQueueService
  ) {}

  async createEventDefinition(createEventDefinitionDto: CreateEventDefinitionDto): Promise<EventDefinition> {
    const eventDefinition = this.eventDefinitionRepository.create(createEventDefinitionDto);
    return this.eventDefinitionRepository.save(eventDefinition);
  }

  async createEventTrigger(createEventTriggerDto: CreateEventTriggerDto): Promise<EventTrigger> {
    const eventTrigger = this.eventTriggerRepository.create(createEventTriggerDto);
    return this.eventTriggerRepository.save(eventTrigger);
  }

  async findEventDefinition(id: string): Promise<EventDefinition> {
    const eventDefinition = await this.eventDefinitionRepository.findOne({
      where: { id },
      relations: ["triggers", "webhooks"],
    });

    if (!eventDefinition) {
      throw new NotFoundException(`Event definition with ID "${id}" not found`);
    }

    return eventDefinition;
  }

  async findEventLog(id: string): Promise<EventLog> {
    const eventLog = await this.eventLogRepository.findOne({
      where: { id },
      relations: ["eventDefinition"],
    });

    if (!eventLog) {
      throw new NotFoundException(`Event log with ID "${id}" not found`);
    }

    return eventLog;
  }

  async updateEventLogStatus(id: string, status: EventStatus, error?: string | null, processedAt?: Date | null): Promise<EventLog> {
    const eventLog = await this.findEventLog(id);

    Object.assign(eventLog, {
      status,
      error: error || null,
      processedAt: processedAt || null,
      retryCount: status === EventStatus.RETRYING ? eventLog.retryCount + 1 : eventLog.retryCount,
    });

    return this.eventLogRepository.save(eventLog);
  }

  async processTrigger(trigger: EventTrigger, payload: Record<string, any>): Promise<void> {
    const targetCollection = await this.collectionService.findOne(trigger.targetCollection.id);

    // Process the action based on the trigger configuration
    switch (trigger.action.operation) {
      case "create":
        // Create a new record in the target collection
        await this.collectionService.createRecord(targetCollection.id, trigger.action.data);
        break;
      case "update":
        // Update records in the target collection
        await this.collectionService.updateRecords(targetCollection.id, trigger.action.filter, trigger.action.data);
        break;
      case "delete":
        // Delete records in the target collection
        await this.collectionService.deleteRecords(targetCollection.id, trigger.action.filter);
        break;
      default:
        throw new Error(`Unknown operation: ${trigger.action.operation}`);
    }
  }

  async handleCollectionEvent(collectionId: string, eventType: string, payload: Record<string, any>): Promise<void> {
    const eventDefinitions = await this.eventDefinitionRepository.find({
      where: {
        collection: { id: collectionId },
        type: eventType as EventType,
        isActive: true,
      },
      relations: ["triggers", "webhooks"],
    });

    for (const eventDefinition of eventDefinitions) {
      if (this.evaluateConditions(eventDefinition.conditions, payload)) {
        const eventLog = await this.eventLogRepository.save({
          eventDefinitionId: eventDefinition.id,
          payload,
          status: EventStatus.PENDING,
        });

        await this.eventQueueService.addToQueue(eventLog.id);
      }
    }
  }

  private evaluateConditions(conditions: Record<string, any>, payload: Record<string, any>): boolean {
    // Simple condition evaluation
    return Object.entries(conditions).every(([key, value]) => {
      return payload[key] === value;
    });
  }
}
