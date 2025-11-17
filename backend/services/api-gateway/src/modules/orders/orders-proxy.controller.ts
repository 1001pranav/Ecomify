/**
 * Orders Proxy Controller
 * Routes order-related requests to Order Service
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { OrdersProxyService } from './orders-proxy.service';

@Controller('api/v1')
export class OrdersProxyController {
  constructor(private readonly ordersProxy: OrdersProxyService) {}

  /**
   * Orders Endpoints
   */

  @Post('orders')
  async createOrder(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('POST', '/orders', null, body, authorization);
  }

  @Get('orders')
  async searchOrders(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('GET', '/orders', query, null, authorization);
  }

  @Get('orders/number/:orderNumber')
  async getOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('GET', `/orders/number/${orderNumber}`, null, null, authorization);
  }

  @Get('orders/:id')
  async getOrderById(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('GET', `/orders/${id}`, null, null, authorization);
  }

  @Get('orders/:id/transitions')
  async getValidTransitions(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('GET', `/orders/${id}/transitions`, null, null, authorization);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('PATCH', `/orders/${id}/status`, null, body, authorization);
  }

  @Post('orders/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('POST', `/orders/${id}/cancel`, null, body, authorization);
  }

  @Post('orders/:id/refunds')
  async createRefund(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('POST', `/orders/${id}/refunds`, null, body, authorization);
  }

  /**
   * Fulfillment Endpoints
   */

  @Post('orders/:orderId/fulfillments')
  async createFulfillment(
    @Param('orderId') orderId: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('POST', `/orders/${orderId}/fulfillments`, null, body, authorization);
  }

  @Get('orders/:orderId/fulfillments')
  async getFulfillments(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersProxy.forwardRequest('GET', `/orders/${orderId}/fulfillments`, null, null, authorization);
  }
}
