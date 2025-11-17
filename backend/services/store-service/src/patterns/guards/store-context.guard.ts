/**
 * Store Context Guard - Chain of Responsibility Pattern
 * Ensures store context is available and sets RLS context
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class StoreContextGuard implements CanActivate {
  private readonly logger = new Logger(StoreContextGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract store ID from various sources
    const storeId =
      request.headers['x-store-id'] ||
      request.user?.storeId ||
      request.params?.storeId ||
      request.params?.id; // For store-level routes

    if (!storeId) {
      throw new BadRequestException('Store context is required');
    }

    // Store in request for downstream handlers
    request.storeId = storeId;

    // Set PostgreSQL RLS context for multi-tenancy
    try {
      await this.prisma.setRLSContext(storeId);
      this.logger.debug(`RLS context set for store: ${storeId}`);
    } catch (error) {
      this.logger.error('Failed to set RLS context:', error);
      // Don't fail the request if RLS setup fails
      // This allows the service to work even without RLS
    }

    return true;
  }
}
