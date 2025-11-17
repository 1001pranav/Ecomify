/**
 * Generator utilities for unique identifiers
 * Following Factory Pattern for ID generation
 */

export interface IDGenerator {
  generate(): string;
}

/**
 * Order Number Generator
 */
export class OrderNumberGenerator implements IDGenerator {
  private static counter = 0;

  generate(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    OrderNumberGenerator.counter = (OrderNumberGenerator.counter + 1) % 1000;
    const counter = OrderNumberGenerator.counter.toString().padStart(3, '0');
    return `ORD-${timestamp}${random}${counter}`;
  }
}

/**
 * Slug Generator
 */
export class SlugGenerator implements IDGenerator {
  static fromString(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  generate(): string {
    return SlugGenerator.fromString(Math.random().toString(36).substring(2, 15));
  }

  /**
   * Generate unique slug with random suffix
   */
  static generateUnique(base: string): string {
    const slug = this.fromString(base);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${suffix}`;
  }
}

/**
 * API Key Generator
 */
export class APIKeyGenerator implements IDGenerator {
  private static readonly PREFIX = 'sk_';

  generate(): string {
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${APIKeyGenerator.PREFIX}${randomBytes}`;
  }

  static validate(key: string): boolean {
    return key.startsWith(this.PREFIX) && key.length === 67;
  }
}

/**
 * Verification Token Generator
 */
export class VerificationTokenGenerator implements IDGenerator {
  generate(): string {
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return randomBytes;
  }

  /**
   * Generate token with expiry
   */
  generateWithExpiry(expiryHours: number = 24): { token: string; expiresAt: Date } {
    const token = this.generate();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);
    return { token, expiresAt };
  }
}

/**
 * ID Generator Factory
 * Factory Pattern implementation
 */
export class IDGeneratorFactory {
  private static generators: Map<string, IDGenerator> = new Map([
    ['order', new OrderNumberGenerator()],
    ['slug', new SlugGenerator()],
    ['apiKey', new APIKeyGenerator()],
    ['verification', new VerificationTokenGenerator()],
  ]);

  static getGenerator(type: string): IDGenerator {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`Generator type '${type}' not found`);
    }
    return generator;
  }

  static registerGenerator(type: string, generator: IDGenerator): void {
    this.generators.set(type, generator);
  }
}
