/**
 * Common validation schemas using Zod
 * Following Strategy Pattern for validation
 */

export interface ValidationSchema<T = any> {
  validate(data: unknown): T;
  validateAsync(data: unknown): Promise<T>;
}

export interface ValidatorStrategy {
  isValid(value: any): boolean;
  errorMessage: string;
}

// Email validator
export class EmailValidator implements ValidatorStrategy {
  errorMessage = 'Invalid email format';

  isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}

// Phone validator
export class PhoneValidator implements ValidatorStrategy {
  errorMessage = 'Invalid phone number format';

  isValid(value: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ''));
  }
}

// URL validator
export class URLValidator implements ValidatorStrategy {
  errorMessage = 'Invalid URL format';

  isValid(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}

// Slug validator
export class SlugValidator implements ValidatorStrategy {
  errorMessage = 'Invalid slug format (lowercase letters, numbers, and hyphens only)';

  isValid(value: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(value);
  }
}

// Export validator factory
export class ValidatorFactory {
  private static validators: Map<string, ValidatorStrategy> = new Map([
    ['email', new EmailValidator()],
    ['phone', new PhoneValidator()],
    ['url', new URLValidator()],
    ['slug', new SlugValidator()],
  ]);

  static getValidator(type: string): ValidatorStrategy {
    const validator = this.validators.get(type);
    if (!validator) {
      throw new Error(`Validator type '${type}' not found`);
    }
    return validator;
  }

  static registerValidator(type: string, validator: ValidatorStrategy): void {
    this.validators.set(type, validator);
  }
}
