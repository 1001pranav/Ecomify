import { Controller, Post, Get, Delete, Body, Param, Query, Put } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async createWebhook(@Body() body: any) {
    return this.webhookService.createWebhook(body);
  }

  @Get(':id')
  async getWebhook(@Param('id') id: string) {
    return this.webhookService.getWebhook(id);
  }

  @Get('store/:storeId')
  async listWebhooks(
    @Param('storeId') storeId: string,
    @Query('topic') topic?: string,
  ) {
    return this.webhookService.listWebhooks(storeId, topic);
  }

  @Put(':id')
  async updateWebhook(@Param('id') id: string, @Body() body: any) {
    return this.webhookService.updateWebhook(id, body);
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') id: string) {
    return this.webhookService.deleteWebhook(id);
  }

  @Post('trigger')
  async triggerWebhooks(@Body() body: { storeId: string; topic: string; payload: any }) {
    return this.webhookService.triggerWebhooks(body.storeId, body.topic, body.payload);
  }

  @Get(':id/deliveries')
  async getDeliveries(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.webhookService.getWebhookDeliveries(id, limit);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.webhookService.getWebhookStats(id);
  }

  @Post(':id/retry')
  async retryFailed(@Param('id') id: string) {
    const count = await this.webhookService.retryFailedWebhooks(id);
    return { retriedCount: count };
  }
}
