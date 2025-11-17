/**
 * Slug Factory - Factory Pattern
 * Generates unique URL-friendly slugs for stores
 */

import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class SlugFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique slug from store name
   * Factory Pattern - Creates unique slugs with collision handling
   */
  async generateUniqueSlug(name: string): Promise<string> {
    // Generate base slug
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Check if slug already exists
   */
  private async slugExists(slug: string): Promise<boolean> {
    const existing = await this.prisma.store.findUnique({
      where: { slug },
      select: { id: true },
    });

    return existing !== null;
  }

  /**
   * Generate subdomain from slug
   * Format: {slug}.ecomify.com
   */
  generateSubdomain(slug: string): string {
    const baseDomain = process.env.BASE_DOMAIN || 'ecomify.com';
    return `${slug}.${baseDomain}`;
  }
}
