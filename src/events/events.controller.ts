import { Controller, Get, Post, Body, Param, Delete, UseGuards, Version } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EventsService } from "./services/events.service";
import { WebhookService } from "./services/webhook.service";
import { CreateEventDefinitionDto } from "./dto/create-event-definition.dto";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { CreateEventTriggerDto } from "./dto/create-event-trigger.dto";

@ApiTags("events")
@Controller({
  path: "events",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly webhookService: WebhookService
  ) {}

  @Post("definitions")
  @Version("1")
  createEventDefinition(@Body() createEventDefinitionDto: CreateEventDefinitionDto) {
    return this.eventsService.createEventDefinition(createEventDefinitionDto);
  }

  @Post("triggers")
  @Version("1")
  createEventTrigger(@Body() createEventTriggerDto: CreateEventTriggerDto) {
    return this.eventsService.createEventTrigger(createEventTriggerDto);
  }

  @Post("webhooks")
  @Version("1")
  createWebhook(@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhookService.create(createWebhookDto);
  }

  @Get("definitions/:id")
  @Version("1")
  findEventDefinition(@Param("id") id: string) {
    return this.eventsService.findEventDefinition(id);
  }
}
