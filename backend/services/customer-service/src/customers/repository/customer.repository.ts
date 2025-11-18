import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Customer, Prisma } from '@prisma/client';

/**
 * Repository Pattern: Encapsulates data access logic for customers
 * Provides abstraction over the data layer
 */
@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new customer
   */
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.prisma.customer.create({
      data,
      include: {
        addresses: true,
      },
    });
  }

  /**
   * Find customer by ID
   */
  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        segmentMemberships: {
          include: {
            segment: true,
          },
        },
      },
    });
  }

  /**
   * Find customer by email and store
   */
  async findByEmail(storeId: string, email: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId,
          email,
        },
      },
      include: {
        addresses: true,
      },
    });
  }

  /**
   * Find all customers for a store
   */
  async findByStore(
    storeId: string,
    options?: {
      skip?: number;
      take?: number;
      search?: string;
      tags?: string[];
    },
  ): Promise<{ customers: Customer[]; total: number }> {
    const where: Prisma.CustomerWhereInput = { storeId };

    // Add search filter
    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Add tags filter
    if (options?.tags && options.tags.length > 0) {
      where.tags = {
        hasSome: options.tags,
      };
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          addresses: true,
        },
        skip: options?.skip,
        take: options?.take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  /**
   * Update customer
   */
  async update(
    id: string,
    data: Prisma.CustomerUpdateInput,
  ): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: {
        addresses: true,
      },
    });
  }

  /**
   * Delete customer
   */
  async delete(id: string): Promise<Customer> {
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Update customer metrics (totalSpent, ordersCount)
   */
  async updateMetrics(
    customerId: string,
    totalSpent: number,
    ordersCount: number,
  ): Promise<void> {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: { increment: totalSpent },
        ordersCount: { increment: ordersCount },
      },
    });
  }

  /**
   * Add address to customer
   */
  async addAddress(customerId: string, addressData: Prisma.AddressCreateInput) {
    return this.prisma.address.create({
      data: {
        ...addressData,
        customer: {
          connect: { id: customerId },
        },
      },
    });
  }

  /**
   * Get customer addresses
   */
  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, data: Prisma.AddressUpdateInput) {
    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string) {
    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }
}
