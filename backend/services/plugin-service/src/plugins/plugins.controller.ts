import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PluginsService } from './plugins.service';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Post()
  async createPlugin(@Body() body: any) {
    return this.pluginsService.createPlugin(body);
  }

  @Get()
  async listPlugins(@Query('isActive') isActive?: string) {
    const filters = isActive !== undefined ? { isActive: isActive === 'true' } : undefined;
    return this.pluginsService.listPlugins(filters);
  }

  @Get(':id')
  async getPlugin(@Param('id') id: string) {
    return this.pluginsService.getPlugin(id);
  }

  @Get('slug/:slug')
  async getPluginBySlug(@Param('slug') slug: string) {
    return this.pluginsService.getPluginBySlug(slug);
  }

  @Put(':id')
  async updatePlugin(@Param('id') id: string, @Body() body: any) {
    return this.pluginsService.updatePlugin(id, body);
  }

  @Delete(':id')
  async deletePlugin(@Param('id') id: string) {
    return this.pluginsService.deletePlugin(id);
  }

  @Get(':id/stats')
  async getPluginStats(@Param('id') id: string) {
    return this.pluginsService.getPluginStats(id);
  }

  @Post('install')
  async installPlugin(@Body() body: { storeId: string; pluginId: string; config?: any }) {
    return this.pluginsService.installPlugin(body.storeId, body.pluginId, body.config);
  }

  @Post('uninstall')
  async uninstallPlugin(@Body() body: { storeId: string; pluginId: string }) {
    return this.pluginsService.uninstallPlugin(body.storeId, body.pluginId);
  }

  @Get('store/:storeId/installations')
  async getStoreInstallations(@Param('storeId') storeId: string) {
    return this.pluginsService.getStoreInstallations(storeId);
  }
}
