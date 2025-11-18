import { PrismaService } from './prisma.service';

/**
 * Repository Pattern - Base Repository
 * Provides common database operations and abstracts data access logic
 */
export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract create(data: any): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<T>;
  abstract findMany(filter: any): Promise<T[]>;
}
