import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { SearchOrdersDto } from './dto/search-orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/v1/orders
   * Create a new order
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  /**
   * GET /api/v1/orders
   * Search and filter orders
   */
  @Get()
  async searchOrders(@Query() dto: SearchOrdersDto) {
    return this.ordersService.searchOrders(dto);
  }

  /**
   * GET /api/v1/orders/:id
   * Get order by ID
   */
  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  /**
   * GET /api/v1/orders/number/:orderNumber
   * Get order by order number
   */
  @Get('number/:orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOrderByNumber(orderNumber);
  }

  /**
   * PATCH /api/v1/orders/:id/status
   * Update order status
   */
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  /**
   * GET /api/v1/orders/:id/transitions
   * Get valid state transitions for an order
   */
  @Get(':id/transitions')
  async getValidTransitions(@Param('id') id: string) {
    return this.ordersService.getValidTransitions(id);
  }

  /**
   * POST /api/v1/orders/:id/cancel
   * Cancel an order
   */
  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(id, dto);
  }

  /**
   * POST /api/v1/orders/:id/refunds
   * Create a refund for an order
   */
  @Post(':id/refunds')
  @HttpCode(HttpStatus.CREATED)
  async createRefund(
    @Param('id') id: string,
    @Body() dto: CreateRefundDto,
  ) {
    return this.ordersService.createRefund(id, dto);
  }
}
