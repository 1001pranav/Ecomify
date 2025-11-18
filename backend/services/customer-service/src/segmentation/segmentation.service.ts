import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { SimpleConditionStrategy } from './strategies/simple-condition.strategy';
import { SegmentationStrategy } from './strategies/segmentation-strategy.interface';
import { CreateSegmentDto, UpdateSegmentDto } from './dto/segment.dto';

/**
 * Segmentation Service: Manages customer segments
 * Uses Strategy Pattern for different segmentation rules
 */
@Injectable()
export class SegmentationService {
  private strategies: Map<string, SegmentationStrategy>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly simpleConditionStrategy: SimpleConditionStrategy,
  ) {
    this.strategies = new Map([
      ['simple', simpleConditionStrategy],
    ]);
  }

  /**
   * Create a new segment
   */
  async createSegment(dto: CreateSegmentDto) {
    return this.prisma.customerSegment.create({
      data: {
        storeId: dto.storeId,
        name: dto.name,
        conditions: dto.conditions,
      },
    });
  }

  /**
   * Get segment by ID
   */
  async getSegment(id: string) {
    const segment = await this.prisma.customerSegment.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${id} not found`);
    }

    return segment;
  }

  /**
   * List segments for a store
   */
  async listSegments(storeId: string) {
    return this.prisma.customerSegment.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update segment
   */
  async updateSegment(id: string, dto: UpdateSegmentDto) {
    const segment = await this.prisma.customerSegment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${id} not found`);
    }

    return this.prisma.customerSegment.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete segment
   */
  async deleteSegment(id: string) {
    const segment = await this.prisma.customerSegment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${id} not found`);
    }

    return this.prisma.customerSegment.delete({
      where: { id },
    });
  }

  /**
   * Evaluate and update segment memberships for a specific segment
   */
  async updateSegmentMemberships(segmentId: string) {
    const segment = await this.prisma.customerSegment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    // Get all customers for this store
    const customers = await this.prisma.customer.findMany({
      where: { storeId: segment.storeId },
    });

    // Use strategy to evaluate customers
    const strategy = this.strategies.get('simple'); // Can be made dynamic

    if (!strategy) {
      throw new Error('Segmentation strategy not found');
    }

    const matchingCustomerIds: string[] = [];

    for (const customer of customers) {
      if (strategy.evaluate(customer, segment.conditions)) {
        matchingCustomerIds.push(customer.id);
      }
    }

    // Clear existing memberships
    await this.prisma.customerSegmentMembership.deleteMany({
      where: { segmentId },
    });

    // Create new memberships
    if (matchingCustomerIds.length > 0) {
      await this.prisma.customerSegmentMembership.createMany({
        data: matchingCustomerIds.map((customerId) => ({
          customerId,
          segmentId,
        })),
      });
    }

    return {
      segmentId,
      customersMatched: matchingCustomerIds.length,
    };
  }

  /**
   * Get customers in a segment
   */
  async getSegmentCustomers(segmentId: string) {
    const segment = await this.prisma.customerSegment.findUnique({
      where: { id: segmentId },
      include: {
        memberships: {
          include: {
            customer: {
              include: {
                addresses: true,
              },
            },
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${segmentId} not found`);
    }

    return segment.memberships.map((m) => m.customer);
  }

  /**
   * Scheduled job: Update all segment memberships
   * Runs daily at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledSegmentUpdate() {
    console.log('🔄 Starting scheduled segment membership update');

    const segments = await this.prisma.customerSegment.findMany();

    for (const segment of segments) {
      try {
        await this.updateSegmentMemberships(segment.id);
        console.log(`✅ Updated segment: ${segment.name}`);
      } catch (error) {
        console.error(`❌ Error updating segment ${segment.name}:`, error);
      }
    }

    console.log('✅ Scheduled segment update completed');
  }
}
