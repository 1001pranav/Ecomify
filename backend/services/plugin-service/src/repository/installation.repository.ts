import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PluginInstallation } from '@prisma/client';

/**
 * Installation Repository - Repository Pattern
 * Abstracts data access for plugin installations
 */
@Injectable()
export class InstallationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    storeId: string;
    pluginId: string;
    apiKey: string;
    apiSecret: string;
    config?: any;
  }): Promise<PluginInstallation> {
    return this.prisma.pluginInstallation.create({ data });
  }

  async findById(id: string): Promise<PluginInstallation | null> {
    return this.prisma.pluginInstallation.findUnique({
      where: { id },
      include: { plugin: true },
    });
  }

  async findByApiKey(apiKey: string): Promise<PluginInstallation | null> {
    return this.prisma.pluginInstallation.findUnique({
      where: { apiKey },
      include: { plugin: true },
    });
  }

  async findByStoreAndPlugin(
    storeId: string,
    pluginId: string,
  ): Promise<PluginInstallation | null> {
    return this.prisma.pluginInstallation.findUnique({
      where: {
        storeId_pluginId: { storeId, pluginId },
      },
      include: { plugin: true },
    });
  }

  async findAllByStore(storeId: string): Promise<PluginInstallation[]> {
    return this.prisma.pluginInstallation.findMany({
      where: { storeId },
      include: { plugin: true },
      orderBy: { installedAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<PluginInstallation>): Promise<PluginInstallation> {
    return this.prisma.pluginInstallation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<PluginInstallation> {
    return this.prisma.pluginInstallation.delete({ where: { id } });
  }
}
