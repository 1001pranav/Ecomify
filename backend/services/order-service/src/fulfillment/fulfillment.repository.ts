import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FulfillmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.fulfillment.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.fulfillment.findUnique({
      where: { id },
    });
  }

  async findByOrderId(orderId: string) {
    return this.prisma.fulfillment.findMany({
      where: { orderId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.fulfillment.update({
      where: { id },
      data,
    });
  }
}
