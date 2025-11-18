import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Plugin } from '@prisma/client';

/**
 * Plugin Repository - Repository Pattern
 * Abstracts data access for plugins
 */
@Injectable()
export class PluginRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    description: string;
    version: string;
    author: string;
    clientId: string;
    clientSecret: string;
    permissions: string[];
    webhookUrl?: string;
  }): Promise<Plugin> {
    return this.prisma.plugin.create({ data });
  }

  async findById(id: string): Promise<Plugin | null> {
    return this.prisma.plugin.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Plugin | null> {
    return this.prisma.plugin.findUnique({ where: { slug } });
  }

  async findByClientId(clientId: string): Promise<Plugin | null> {
    return this.prisma.plugin.findUnique({ where: { clientId } });
  }

  async findAll(filters?: { isActive?: boolean }): Promise<Plugin[]> {
    return this.prisma.plugin.findMany({
      where: filters,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Partial<Plugin>): Promise<Plugin> {
    return this.prisma.plugin.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Plugin> {
    return this.prisma.plugin.delete({ where: { id } });
  }

  async countInstallations(pluginId: string): Promise<number> {
    return this.prisma.pluginInstallation.count({
      where: { pluginId, isActive: true },
    });
  }
}
