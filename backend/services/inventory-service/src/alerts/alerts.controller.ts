import { Controller, Post, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { IsNumber, Min } from 'class-validator';

class UpdateThresholdDto {
  @IsNumber()
  @Min(0)
  threshold: number;
}

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('check')
  async checkLowStock() {
    await this.alertsService.checkLowStock();
    return { success: true, message: 'Low stock check completed' };
  }

  @Get('active')
  async getActive(@Query('storeId') storeId: string) {
    return this.alertsService.getActiveAlerts(storeId);
  }

  @Get('history')
  async getHistory(
    @Query('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.alertsService.getAlertHistory(
      storeId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch(':id/dismiss')
  async dismiss(@Param('id') id: string) {
    return this.alertsService.dismissAlert(id);
  }

  @Patch('threshold/:variantId/:locationId')
  async updateThreshold(
    @Param('variantId') variantId: string,
    @Param('locationId') locationId: string,
    @Body() dto: UpdateThresholdDto,
  ) {
    return this.alertsService.updateThreshold(variantId, locationId, dto.threshold);
  }
}
