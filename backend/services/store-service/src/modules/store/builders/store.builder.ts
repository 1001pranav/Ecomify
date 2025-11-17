/**
 * Store Builder - Builder Pattern
 * Constructs Store objects with default settings and validation
 */

import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from '../dto/create-store.dto';
import { SlugFactory } from '../factories/slug.factory';
import { DEFAULT_THEME } from '../dto/theme-config.dto';

export interface StoreConstructorData {
  ownerId: string;
  name: string;
  slug: string;
  domain: string;
  email: string;
  phone?: string | null;
  currency: string;
  locale: string;
  timezone: string;
  settings: any;
  theme: any;
}

@Injectable()
export class StoreBuilder {
  private ownerId: string;
  private name: string;
  private slug: string;
  private domain: string;
  private email: string;
  private phone: string | null = null;
  private currency = 'USD';
  private locale = 'en-US';
  private timezone = 'UTC';
  private settings: any = {};
  private theme: any = DEFAULT_THEME;

  constructor(private readonly slugFactory: SlugFactory) {}

  /**
   * Create new builder instance
   */
  static create(slugFactory: SlugFactory): StoreBuilder {
    return new StoreBuilder(slugFactory);
  }

  /**
   * Set store owner
   */
  withOwner(ownerId: string): this {
    this.ownerId = ownerId;
    return this;
  }

  /**
   * Set store basic info
   */
  withBasicInfo(name: string, email: string): this {
    this.name = name;
    this.email = email;
    return this;
  }

  /**
   * Set optional phone
   */
  withPhone(phone: string): this {
    this.phone = phone;
    return this;
  }

  /**
   * Set currency
   */
  withCurrency(currency: string): this {
    this.currency = currency;
    return this;
  }

  /**
   * Set locale
   */
  withLocale(locale: string): this {
    this.locale = locale;
    return this;
  }

  /**
   * Set timezone
   */
  withTimezone(timezone: string): this {
    this.timezone = timezone;
    return this;
  }

  /**
   * Set custom settings
   */
  withSettings(settings: any): this {
    this.settings = { ...this.settings, ...settings };
    return this;
  }

  /**
   * Set custom theme
   */
  withTheme(theme: any): this {
    this.theme = { ...this.theme, ...theme };
    return this;
  }

  /**
   * Build store from DTO
   */
  async fromDto(ownerId: string, dto: CreateStoreDto): Promise<StoreConstructorData> {
    this.withOwner(ownerId);
    this.withBasicInfo(dto.name, dto.email);

    if (dto.phone) this.withPhone(dto.phone);
    if (dto.currency) this.withCurrency(dto.currency);
    if (dto.locale) this.withLocale(dto.locale);
    if (dto.timezone) this.withTimezone(dto.timezone);

    return this.build();
  }

  /**
   * Build and return store data
   * Generates slug and domain as final step
   */
  async build(): Promise<StoreConstructorData> {
    // Generate unique slug
    this.slug = await this.slugFactory.generateUniqueSlug(this.name);

    // Generate subdomain
    this.domain = this.slugFactory.generateSubdomain(this.slug);

    // Validate required fields
    if (!this.ownerId || !this.name || !this.email) {
      throw new Error('Owner ID, name, and email are required');
    }

    return {
      ownerId: this.ownerId,
      name: this.name,
      slug: this.slug,
      domain: this.domain,
      email: this.email,
      phone: this.phone,
      currency: this.currency,
      locale: this.locale,
      timezone: this.timezone,
      settings: this.settings,
      theme: this.theme,
    };
  }
}
