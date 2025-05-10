import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { EventDefinition } from "./entities/event-definition.entity";
import { EventLog } from "./entities/event-log.entity";
import { EventTrigger } from "./entities/event-trigger.entity";
import { Webhook } from "./entities/webhook.entity";
import { EventsService } from "./services/events.service";
import { EventQueueService } from "./services/event-queue.service";
import { WebhookService } from "./services/webhook.service";
import { EventsController } from "./events.controller";
import { CollectionsModule } from "../collections/collections.module";
import { LoggingModule } from "../logging/logging.module";

@Module({
  imports: [TypeOrmModule.forFeature([EventDefinition, EventLog, EventTrigger, Webhook]), ConfigModule, CollectionsModule, LoggingModule],
  controllers: [EventsController],
  providers: [EventsService, EventQueueService, WebhookService],
  exports: [EventsService],
})
export class EventsModule {}
