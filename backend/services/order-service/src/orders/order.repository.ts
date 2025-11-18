import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/base.repository';

/**
 * Repository Pattern - Order Repository
 * Encapsulates all data access logic for Order entity
 * Provides abstraction over the data layer
 */
@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: any): Promise<Order> {
    return this.prisma.order.create({
      data,
      include: {
        lineItems: true,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        lineItems: true,
        fulfillments: true,
        statusHistory: true,
        refunds: true,
      },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        lineItems: true,
        fulfillments: true,
      },
    });
  }

  async update(id: string, data: any): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        lineItems: true,
        fulfillments: true,
      },
    });
  }

  async delete(id: string): Promise<Order> {
    return this.prisma.order.delete({
      where: { id },
    });
  }

  async findMany(filter: {
    storeId?: string;
    customerId?: string;
    email?: string;
    financialStatus?: string[];
    fulfillmentStatus?: string[];
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ orders: Order[]; total: number }> {
    const {
      storeId,
      customerId,
      email,
      financialStatus,
      fulfillmentStatus,
      search,
      dateFrom,
      dateTo,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    // Build where clause
    const where: any = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (financialStatus && financialStatus.length > 0) {
      where.financialStatus = { in: financialStatus };
    }

    if (fulfillmentStatus && fulfillmentStatus.length > 0) {
      where.fulfillmentStatus = { in: fulfillmentStatus };
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Execute queries
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          lineItems: true,
          fulfillments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async createStatusHistory(data: {
    orderId: string;
    previousFinancialStatus?: string;
    newFinancialStatus?: string;
    previousFulfillmentStatus?: string;
    newFulfillmentStatus?: string;
    comment?: string;
    changedBy?: string;
  }): Promise<any> {
    return this.prisma.orderStatusHistory.create({
      data,
    });
  }

  async createRefund(data: {
    orderId: string;
    amount: number;
    reason?: string;
    restockItems: boolean;
  }): Promise<any> {
    return this.prisma.refund.create({
      data: {
        ...data,
        amount: data.amount,
      },
    });
  }
}
