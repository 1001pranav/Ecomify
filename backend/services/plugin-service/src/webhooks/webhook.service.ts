import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiKeyFactory } from '../plugins/api-key.factory';
import axios from 'axios';

/**
 * Webhook Service
 * Manages webhook subscriptions and deliveries with retry logic
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 5000, 15000]; // ms

  constructor(
    private readonly prisma: PrismaService,
    private readonly apiKeyFactory: ApiKeyFactory,
  ) {}

  /**
   * Create webhook subscription
   */
  async createWebhook(data: {
    storeId: string;
    pluginId?: string;
    topic: string;
    address: string;
    format?: string;
  }) {
    // Generate HMAC secret for this webhook
    const secret = this.apiKeyFactory.generateApiSecret();

    const webhook = await this.prisma.webhook.create({
      data: {
        ...data,
        secret,
        format: data.format || 'json',
        isActive: true,
      },
    });

    this.logger.log(`Webhook created: ${webhook.id} for topic ${webhook.topic}`);

    return {
      ...webhook,
      // Include secret in response (only once)
      secret,
    };
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(webhookId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  /**
   * List webhooks for a store
   */
  async listWebhooks(storeId: string, topic?: string) {
    return this.prisma.webhook.findMany({
      where: {
        storeId,
        ...(topic && { topic }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, data: any) {
    await this.getWebhook(webhookId);
    return this.prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string) {
    await this.getWebhook(webhookId);
    return this.prisma.webhook.delete({
      where: { id: webhookId },
    });
  }

  /**
   * Trigger webhook for a topic
   */
  async triggerWebhooks(storeId: string, topic: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        storeId,
        topic,
        isActive: true,
      },
    });

    this.logger.log(`Triggering ${webhooks.length} webhooks for topic: ${topic}`);

    for (const webhook of webhooks) {
      // Deliver webhook asynchronously (don't wait)
      this.deliverWebhook(webhook.id, payload).catch((error) => {
        this.logger.error(`Failed to deliver webhook ${webhook.id}`, error);
      });
    }

    return { triggered: webhooks.length };
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    webhookId: string,
    payload: any,
    attempt: number = 1,
  ): Promise<void> {
    const webhook = await this.getWebhook(webhookId);

    try {
      // Prepare payload
      const payloadString = JSON.stringify(payload);

      // Generate HMAC signature
      const signature = this.apiKeyFactory.generateHmacSignature(
        payloadString,
        webhook.secret,
      );

      // Send HTTP request
      const response = await axios.post(
        webhook.address,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Topic': webhook.topic,
            'X-Webhook-Id': webhook.id,
          },
          timeout: 10000, // 10 second timeout
        },
      );

      // Log successful delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          payload,
          response: JSON.stringify(response.data),
          statusCode: response.status,
          attempts: attempt,
          success: true,
        },
      });

      this.logger.log(`Webhook ${webhookId} delivered successfully on attempt ${attempt}`);
    } catch (error) {
      this.logger.warn(`Webhook ${webhookId} delivery failed (attempt ${attempt}): ${error.message}`);

      // Log failed delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          payload,
          response: error.response?.data ? JSON.stringify(error.response.data) : error.message,
          statusCode: error.response?.status || 0,
          attempts: attempt,
          success: false,
        },
      });

      // Retry logic
      if (attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt - 1] || 15000;
        this.logger.log(`Retrying webhook ${webhookId} in ${delay}ms...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.deliverWebhook(webhookId, payload, attempt + 1);
      } else {
        this.logger.error(`Webhook ${webhookId} failed after ${this.MAX_RETRIES} attempts`);
      }
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    return this.apiKeyFactory.verifyHmacSignature(payload, signature, secret);
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookDeliveries(webhookId: string, limit: number = 50) {
    await this.getWebhook(webhookId);

    return this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get webhook delivery stats
   */
  async getWebhookStats(webhookId: string) {
    await this.getWebhook(webhookId);

    const [totalDeliveries, successfulDeliveries, failedDeliveries] = await Promise.all([
      this.prisma.webhookDelivery.count({ where: { webhookId } }),
      this.prisma.webhookDelivery.count({ where: { webhookId, success: true } }),
      this.prisma.webhookDelivery.count({ where: { webhookId, success: false } }),
    ]);

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0,
    };
  }

  /**
   * Retry failed webhooks
   */
  async retryFailedWebhooks(webhookId: string): Promise<number> {
    const failedDeliveries = await this.prisma.webhookDelivery.findMany({
      where: {
        webhookId,
        success: false,
        attempts: {
          lt: this.MAX_RETRIES,
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    for (const delivery of failedDeliveries) {
      await this.deliverWebhook(webhookId, delivery.payload, delivery.attempts + 1);
    }

    return failedDeliveries.length;
  }
}
