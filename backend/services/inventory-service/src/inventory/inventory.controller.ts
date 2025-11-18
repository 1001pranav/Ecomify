import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('reserve')
  async reserve(@Body() dto: ReserveInventoryDto) {
    return this.inventoryService.reserveInventory(dto);
  }

  @Post('release')
  async release(@Body() body: { orderId: string }) {
    return this.inventoryService.releaseReservationByOrder(body.orderId);
  }

  @Post('adjust')
  async adjust(@Body() dto: AdjustInventoryDto) {
    return this.inventoryService.adjustInventory(dto);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferInventoryDto) {
    return this.inventoryService.transferInventory(dto);
  }

  @Get('variants/:variantId')
  async getByVariant(@Param('variantId') variantId: string) {
    return this.inventoryService.getInventoryByVariant(variantId);
  }

  @Get('locations/:locationId')
  async getByLocation(
    @Param('locationId') locationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getInventoryByLocation(
      locationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('adjustments')
  async getAdjustments(
    @Query('variantId') variantId?: string,
    @Query('locationId') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getAdjustmentHistory(
      variantId,
      locationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
