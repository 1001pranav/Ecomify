import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification(@Body() body: any) {
    const { channel, recipient, event, data, options } = body;
    return this.notificationsService.sendNotification(
      channel,
      recipient,
      event,
      data,
      options,
    );
  }

  @Post('send-multi')
  async sendMultiChannel(@Body() body: any) {
    const { channels, recipient, event, data, options } = body;
    return this.notificationsService.sendMultiChannel(
      channels,
      recipient,
      event,
      data,
      options,
    );
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.notificationsService.getNotificationStatus(id);
  }

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getUserNotifications(userId, limit);
  }

  @Post('retry-failed')
  async retryFailed() {
    const count = await this.notificationsService.retryFailedNotifications();
    return { retriedCount: count };
  }
}
