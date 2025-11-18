import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CapturePaymentDto } from './dto/capture-payment.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  async createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(dto);
  }

  @Post('capture')
  async capturePayment(@Body() dto: CapturePaymentDto) {
    return this.paymentsService.capturePayment(dto);
  }

  @Post('refunds')
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.paymentsService.createRefund(dto);
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    return this.paymentsService.getTransaction(id);
  }

  @Get('orders/:orderId/transactions')
  async getTransactionsByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getTransactionsByOrder(orderId);
  }

  @Get('stores/:storeId/transactions')
  async getTransactionsByStore(
    @Param('storeId') storeId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.getTransactionsByStore(
      storeId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
