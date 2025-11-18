import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CustomerRepository } from './repository/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto, CreateAddressDto } from './dto/customer.dto';

/**
 * Customer Service: Business logic for customer management
 * Uses Repository Pattern for data access
 */
@Injectable()
export class CustomersService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  /**
   * Create a new customer
   */
  async createCustomer(dto: CreateCustomerDto) {
    // Check if customer already exists
    const existing = await this.customerRepository.findByEmail(
      dto.storeId,
      dto.email,
    );

    if (existing) {
      throw new ConflictException(
        `Customer with email ${dto.email} already exists`,
      );
    }

    return this.customerRepository.create({
      storeId: dto.storeId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      tags: dto.tags || [],
      note: dto.note,
      acceptsMarketing: dto.acceptsMarketing || false,
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(id: string) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  /**
   * List customers with filtering and pagination
   */
  async listCustomers(
    storeId: string,
    search?: string,
    tags?: string[],
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const { customers, total } = await this.customerRepository.findByStore(
      storeId,
      {
        skip,
        take: limit,
        search,
        tags,
      },
    );

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.customerRepository.update(id, dto);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.customerRepository.delete(id);
  }

  /**
   * Add address to customer
   */
  async addAddress(customerId: string, dto: CreateAddressDto) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return this.customerRepository.addAddress(customerId, dto as any);
  }

  /**
   * Get customer addresses
   */
  async getAddresses(customerId: string) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return this.customerRepository.getAddresses(customerId);
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, dto: Partial<CreateAddressDto>) {
    return this.customerRepository.updateAddress(addressId, dto);
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string) {
    return this.customerRepository.deleteAddress(addressId);
  }
}
