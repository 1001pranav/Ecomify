/**
 * Store Controller
 * Handles HTTP requests for store management
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../../patterns/guards/jwt-auth.guard';
import { RolesGuard } from '../../patterns/guards/roles.guard';
import { CurrentUser } from '../../patterns/decorators/store-context.decorator';
import { Roles, Role } from '../../patterns/decorators/roles.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * POST /api/v1/stores
   * US-BE-201: Create Store
   */
  @Post()
  @Roles(Role.MERCHANT, Role.PLATFORM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createStore(
    @CurrentUser('userId') userId: string,
    @Body() createStoreDto: CreateStoreDto,
  ) {
    return this.storeService.createStore(userId, createStoreDto);
  }

  /**
   * GET /api/v1/stores/:id
   * US-BE-202: Get Store Details
   */
  @Get(':id')
  async getStore(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.storeService.getStoreById(id, userId);
  }

  /**
   * GET /api/v1/stores
   * US-BE-202: Get Stores by Owner
   */
  @Get()
  async getStores(@Query('ownerId') ownerId: string) {
    return this.storeService.getStoresByOwner(ownerId);
  }

  /**
   * PATCH /api/v1/stores/:id
   * US-BE-203: Update Store Settings
   */
  @Patch(':id')
  async updateStore(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storeService.updateStore(id, userId, updateStoreDto);
  }

  /**
   * PUT /api/v1/stores/:id/theme
   * US-BE-204: Update Store Theme
   */
  @Put(':id/theme')
  async updateTheme(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() themeConfig: any,
  ) {
    return this.storeService.updateTheme(id, userId, themeConfig);
  }

  /**
   * PATCH /api/v1/stores/:id/status
   * US-BE-206: Update Store Status
   */
  @Patch(':id/status')
  @Roles(Role.MERCHANT, Role.PLATFORM_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
    @Body() updateStatusDto: UpdateStoreStatusDto,
  ) {
    return this.storeService.updateStatus(id, userId, updateStatusDto, roles);
  }
}
