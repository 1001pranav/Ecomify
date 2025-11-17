/**
 * Orders Proxy Module
 */

import { Module } from '@nestjs/common';
import { OrdersProxyController } from './orders-proxy.controller';
import { OrdersProxyService } from './orders-proxy.service';

@Module({
  controllers: [OrdersProxyController],
  providers: [OrdersProxyService],
  exports: [OrdersProxyService],
})
export class OrdersProxyModule {}
