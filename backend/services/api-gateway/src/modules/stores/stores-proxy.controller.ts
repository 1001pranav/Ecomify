/**
 * Stores Proxy Controller
 * Routes store-related requests to Store Service
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
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StoresProxyService } from './stores-proxy.service';

@Controller('api/v1/stores')
export class StoresProxyController {
  constructor(private readonly storesProxy: StoresProxyService) {}

  @Post()
  async createStore(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.createStore(body, authorization);
  }

  @Get(':id')
  async getStore(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.getStore(id, authorization);
  }

  @Get()
  async getStores(
    @Query('ownerId') ownerId: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.getStores(ownerId, authorization);
  }

  @Patch(':id')
  async updateStore(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.updateStore(id, body, authorization);
  }

  @Put(':id/theme')
  async updateTheme(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.updateTheme(id, body, authorization);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.storesProxy.updateStatus(id, body, authorization);
  }
}
