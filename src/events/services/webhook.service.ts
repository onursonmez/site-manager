import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../entities/webhook.entity';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import axios from 'axios';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async create(createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create(createWebhookDto);
    return this.webhookRepository.save(webhook);
  }

  async sendWebhook(
    webhook: Webhook,
    payload: Record<string, any>,
  ): Promise<void> {
    try {
      await axios.post(webhook.url, payload, {
        headers: webhook.headers,
      });
    } catch (error) {
      throw new Error(`Failed to send webhook: ${error.message}`);
    }
  }
}