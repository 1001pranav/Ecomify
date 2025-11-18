import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateAddressDto,
  CustomerQueryDto,
} from './dto/customer.dto';

/**
 * Customers Controller
 * Exposes REST API endpoints for customer management
 */
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * POST /api/v1/customers
   * Create a new customer
   */
  @Post()
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(dto);
  }

  /**
   * GET /api/v1/customers/:id
   * Get customer by ID
   */
  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    return this.customersService.getCustomer(id);
  }

  /**
   * GET /api/v1/customers
   * List customers with filtering and pagination
   */
  @Get()
  async listCustomers(@Query() query: CustomerQueryDto) {
    return this.customersService.listCustomers(
      query.storeId,
      query.search,
      query.tags,
      query.page,
      query.limit,
    );
  }

  /**
   * PATCH /api/v1/customers/:id
   * Update customer
   */
  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(id, dto);
  }

  /**
   * DELETE /api/v1/customers/:id
   * Delete customer
   */
  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.customersService.deleteCustomer(id);
  }

  /**
   * POST /api/v1/customers/:id/addresses
   * Add address to customer
   */
  @Post(':id/addresses')
  async addAddress(
    @Param('id') customerId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customersService.addAddress(customerId, dto);
  }

  /**
   * GET /api/v1/customers/:id/addresses
   * Get customer addresses
   */
  @Get(':id/addresses')
  async getAddresses(@Param('id') customerId: string) {
    return this.customersService.getAddresses(customerId);
  }

  /**
   * PATCH /api/v1/customers/addresses/:addressId
   * Update address
   */
  @Patch('addresses/:addressId')
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.customersService.updateAddress(addressId, dto);
  }

  /**
   * DELETE /api/v1/customers/addresses/:addressId
   * Delete address
   */
  @Delete('addresses/:addressId')
  async deleteAddress(@Param('addressId') addressId: string) {
    return this.customersService.deleteAddress(addressId);
  }
}
