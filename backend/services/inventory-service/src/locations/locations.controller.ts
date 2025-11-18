import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

class CreateLocationDto {
  @IsString()
  storeId: string;

  @IsString()
  name: string;

  @IsOptional()
  address?: any;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  address?: any;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  async create(@Body() dto: CreateLocationDto) {
    return this.locationsService.createLocation(dto);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.locationsService.getLocation(id);
  }

  @Get()
  async getByStore(@Query('storeId') storeId: string) {
    return this.locationsService.getLocationsByStore(storeId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.locationsService.updateLocation(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.locationsService.deleteLocation(id);
  }
}
