import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from './alerts/alerts.service';

/**
 * Scheduler Service
 * Runs periodic tasks like low stock checks
 */
@Injectable()
export class SchedulerService {
  constructor(private alertsService: AlertsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleLowStockCheck() {
    console.log('🔍 Running low stock check...');
    try {
      await this.alertsService.checkLowStock();
      console.log('✅ Low stock check completed');
    } catch (error) {
      console.error('❌ Low stock check failed:', error.message);
    }
  }
}
