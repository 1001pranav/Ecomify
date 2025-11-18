import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { CreateFulfillmentDto } from './dto/create-fulfillment.dto';

@Controller('orders')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  /**
   * POST /api/v1/orders/:orderId/fulfillments
   * Create a fulfillment for an order
   */
  @Post(':orderId/fulfillments')
  @HttpCode(HttpStatus.CREATED)
  async createFulfillment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateFulfillmentDto,
  ) {
    return this.fulfillmentService.createFulfillment(orderId, dto);
  }

  /**
   * GET /api/v1/orders/:orderId/fulfillments
   * Get fulfillments for an order
   */
  @Get(':orderId/fulfillments')
  async getFulfillments(@Param('orderId') orderId: string) {
    return this.fulfillmentService.getFulfillmentsByOrderId(orderId);
  }
}
