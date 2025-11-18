import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventPublisher } from '../events/event-publisher.service';

interface CreateLocationDto {
  storeId: string;
  name: string;
  address?: any;
  priority?: number;
}

interface UpdateLocationDto {
  name?: string;
  address?: any;
  priority?: number;
  isActive?: boolean;
}

/**
 * Repository Pattern: Locations Service
 * Manages inventory locations
 */
@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
  ) {}

  async createLocation(dto: CreateLocationDto) {
    const location = await this.prisma.inventoryLocation.create({
      data: {
        storeId: dto.storeId,
        name: dto.name,
        address: dto.address as any,
        priority: dto.priority || 0,
      },
    });

    await this.eventPublisher.publish('location.created', {
      locationId: location.id,
      storeId: location.storeId,
      name: location.name,
    });

    return location;
  }

  async getLocation(id: string) {
    const location = await this.prisma.inventoryLocation.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async getLocationsByStore(storeId: string) {
    return this.prisma.inventoryLocation.findMany({
      where: { storeId },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    const location = await this.prisma.inventoryLocation.update({
      where: { id },
      data: dto,
    });

    await this.eventPublisher.publish('location.updated', {
      locationId: location.id,
      storeId: location.storeId,
    });

    return location;
  }

  async deleteLocation(id: string) {
    // Check if location has inventory
    const itemCount = await this.prisma.inventoryItem.count({
      where: { locationId: id },
    });

    if (itemCount > 0) {
      throw new NotFoundException(
        'Cannot delete location with existing inventory. Please transfer inventory first.'
      );
    }

    await this.prisma.inventoryLocation.delete({
      where: { id },
    });

    await this.eventPublisher.publish('location.deleted', {
      locationId: id,
    });

    return { success: true };
  }
}
