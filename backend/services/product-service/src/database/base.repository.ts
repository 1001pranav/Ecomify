import { PrismaService } from './prisma.service';

/**
 * Repository Pattern - Base repository with common CRUD operations
 * Provides abstraction layer between domain logic and data access
 */
export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  protected get model() {
    return this.prisma[this.modelName];
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  async findMany(where?: any, include?: any, orderBy?: any): Promise<T[]> {
    return this.model.findMany({
      where,
      include,
      orderBy,
    });
  }

  async findFirst(where: any, include?: any): Promise<T | null> {
    return this.model.findFirst({
      where,
      include,
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({
      where,
    });
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({
      where,
    });
    return count > 0;
  }

  /**
   * Paginated query
   */
  async paginate(
    where?: any,
    page: number = 1,
    limit: number = 20,
    include?: any,
    orderBy?: any,
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
