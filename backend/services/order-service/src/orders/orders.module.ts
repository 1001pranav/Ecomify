import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { OrderNumberFactory } from './patterns/order-number.factory';
import { OrderBuilder } from './patterns/order.builder';
import { SagaOrchestratorService } from './saga/saga-orchestrator.service';
import { OrderStateMachineService } from './state/order-state-machine.service';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    OrderNumberFactory,
    OrderBuilder,
    SagaOrchestratorService,
    OrderStateMachineService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
