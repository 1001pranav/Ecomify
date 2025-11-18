import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationStrategyFactory } from '../strategies/notification-strategy.factory';
import { TemplateService } from '../templates/template.service';

/**
 * Notifications Service
 * Orchestrates notification delivery using Strategy and Template Method patterns
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly strategyFactory: NotificationStrategyFactory,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Send notification through specified channel
   */
  async sendNotification(
    channel: string,
    recipient: string,
    event: string,
    data: Record<string, any>,
    options?: {
      userId?: string;
      storeId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<string> {
    try {
      // Validate channel
      if (!this.strategyFactory.isChannelSupported(channel)) {
        throw new Error(`Unsupported channel: ${channel}`);
      }

      // Render template
      const { subject, content } = await this.templateService.renderTemplate(
        event,
        channel,
        data,
        options?.storeId,
      );

      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId: options?.userId,
          storeId: options?.storeId,
          channel,
          recipient,
          subject,
          content,
          status: 'PENDING',
          metadata: options?.metadata,
        },
      });

      // Get strategy and send
      const strategy = this.strategyFactory.getStrategy(channel);
      const success = await strategy.send(recipient, subject || '', content, options?.metadata);

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : undefined,
          error: success ? undefined : 'Delivery failed',
        },
      });

      this.logger.log(`Notification ${notification.id} sent via ${channel} to ${recipient}`);
      return notification.id;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send notification to multiple channels
   */
  async sendMultiChannel(
    channels: string[],
    recipient: string,
    event: string,
    data: Record<string, any>,
    options?: {
      userId?: string;
      storeId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const channel of channels) {
      try {
        const id = await this.sendNotification(channel, recipient, event, data, options);
        notificationIds.push(id);
      } catch (error) {
        this.logger.error(`Failed to send via ${channel}`, error);
      }
    }

    return notificationIds;
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications(): Promise<number> {
    const failedNotifications = await this.prisma.notification.findMany({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 100,
    });

    let retriedCount = 0;

    for (const notification of failedNotifications) {
      try {
        const strategy = this.strategyFactory.getStrategy(notification.channel);
        const success = await strategy.send(
          notification.recipient,
          notification.subject || '',
          notification.content,
          notification.metadata as Record<string, any>,
        );

        if (success) {
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              error: null,
            },
          });
          retriedCount++;
        } else {
          await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'RETRY',
            },
          });
        }
      } catch (error) {
        this.logger.error(`Retry failed for notification ${notification.id}`, error);
      }
    }

    this.logger.log(`Retried ${retriedCount} failed notifications`);
    return retriedCount;
  }

  /**
   * Get notification status
   */
  async getNotificationStatus(notificationId: string) {
    return this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
