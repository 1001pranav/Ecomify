import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PluginRepository } from '../repository/plugin.repository';
import { InstallationRepository } from '../repository/installation.repository';
import { ApiKeyFactory } from './api-key.factory';

/**
 * Plugins Service
 * Manages plugins and installations using Repository and Factory patterns
 */
@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);

  constructor(
    private readonly pluginRepo: PluginRepository,
    private readonly installationRepo: InstallationRepository,
    private readonly apiKeyFactory: ApiKeyFactory,
  ) {}

  /**
   * Create a new plugin
   */
  async createPlugin(data: {
    name: string;
    slug: string;
    description: string;
    version: string;
    author: string;
    permissions: string[];
    webhookUrl?: string;
  }) {
    try {
      // Generate OAuth2 credentials
      const { clientId, clientSecret } = this.apiKeyFactory.generateOAuthCredentials();

      // Hash the client secret
      const hashedSecret = this.apiKeyFactory.hashSecret(clientSecret);

      const plugin = await this.pluginRepo.create({
        ...data,
        clientId,
        clientSecret: hashedSecret,
      });

      this.logger.log(`Plugin created: ${plugin.id}`);

      // Return client secret only once (it won't be retrievable later)
      return {
        ...plugin,
        clientSecret, // Return unhashed secret for developer to save
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Plugin slug already exists');
      }
      throw error;
    }
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(pluginId: string) {
    const plugin = await this.pluginRepo.findById(pluginId);
    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }
    return plugin;
  }

  /**
   * Get plugin by slug
   */
  async getPluginBySlug(slug: string) {
    const plugin = await this.pluginRepo.findBySlug(slug);
    if (!plugin) {
      throw new NotFoundException('Plugin not found');
    }
    return plugin;
  }

  /**
   * List all plugins
   */
  async listPlugins(filters?: { isActive?: boolean }) {
    return this.pluginRepo.findAll(filters);
  }

  /**
   * Update plugin
   */
  async updatePlugin(pluginId: string, data: any) {
    const plugin = await this.getPlugin(pluginId);
    return this.pluginRepo.update(pluginId, data);
  }

  /**
   * Delete plugin
   */
  async deletePlugin(pluginId: string) {
    await this.getPlugin(pluginId);
    return this.pluginRepo.delete(pluginId);
  }

  /**
   * Install plugin for a store
   */
  async installPlugin(storeId: string, pluginId: string, config?: any) {
    try {
      // Check if plugin exists
      const plugin = await this.getPlugin(pluginId);

      // Check if already installed
      const existing = await this.installationRepo.findByStoreAndPlugin(storeId, pluginId);
      if (existing) {
        throw new ConflictException('Plugin already installed');
      }

      // Generate API credentials for this installation
      const apiKey = this.apiKeyFactory.generateApiKey('inst');
      const apiSecret = this.apiKeyFactory.generateApiSecret();
      const hashedSecret = this.apiKeyFactory.hashSecret(apiSecret);

      const installation = await this.installationRepo.create({
        storeId,
        pluginId,
        apiKey,
        apiSecret: hashedSecret,
        config,
      });

      this.logger.log(`Plugin ${pluginId} installed for store ${storeId}`);

      // Return API credentials (only once)
      return {
        ...installation,
        apiSecret, // Return unhashed secret for store to save
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to install plugin: ${error.message}`);
    }
  }

  /**
   * Uninstall plugin from a store
   */
  async uninstallPlugin(storeId: string, pluginId: string) {
    const installation = await this.installationRepo.findByStoreAndPlugin(storeId, pluginId);
    if (!installation) {
      throw new NotFoundException('Plugin installation not found');
    }

    await this.installationRepo.delete(installation.id);
    this.logger.log(`Plugin ${pluginId} uninstalled from store ${storeId}`);

    return { message: 'Plugin uninstalled successfully' };
  }

  /**
   * Get store installations
   */
  async getStoreInstallations(storeId: string) {
    return this.installationRepo.findAllByStore(storeId);
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string) {
    const installation = await this.installationRepo.findByApiKey(apiKey);
    if (!installation || !installation.isActive) {
      return null;
    }
    return installation;
  }

  /**
   * Get plugin installation stats
   */
  async getPluginStats(pluginId: string) {
    const plugin = await this.getPlugin(pluginId);
    const installationCount = await this.pluginRepo.countInstallations(pluginId);

    return {
      plugin,
      installationCount,
    };
  }
}
