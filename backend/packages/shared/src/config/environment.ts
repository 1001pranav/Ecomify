/**
 * Environment configuration utilities
 * Following Singleton pattern for configuration management
 */

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiUrl: string;
  database: {
    url: string;
    replicaUrl?: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  rabbitmq: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cors: {
    allowedOrigins: string[];
  };
}

/**
 * Environment configuration class (Singleton)
 */
export class Environment {
  private static instance: Environment;
  private config: EnvironmentConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get Environment instance (Singleton)
   */
  static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  private loadConfig(): EnvironmentConfig {
    return {
      nodeEnv: this.get('NODE_ENV', 'development'),
      port: parseInt(this.get('PORT', '3000'), 10),
      apiUrl: this.get('API_URL', 'http://localhost:3000'),
      database: {
        url: this.get('DATABASE_URL', ''),
        replicaUrl: this.get('DATABASE_REPLICA_URL'),
      },
      redis: {
        host: this.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.get('REDIS_PORT', '6379'), 10),
        password: this.get('REDIS_PASSWORD'),
      },
      rabbitmq: {
        url: this.get('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672'),
      },
      jwt: {
        secret: this.get('JWT_SECRET', 'dev-secret'),
        expiresIn: this.get('JWT_EXPIRES_IN', '15m'),
        refreshSecret: this.get('REFRESH_TOKEN_SECRET', 'dev-refresh-secret'),
        refreshExpiresIn: this.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
      },
      cors: {
        allowedOrigins: this.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
      },
    };
  }

  private get(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value || defaultValue!;
  }

  /**
   * Get configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get specific config value
   */
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}

/**
 * Get environment configuration
 */
export function getEnvironment(): Environment {
  return Environment.getInstance();
}
