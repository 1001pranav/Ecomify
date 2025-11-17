/**
 * Stores Proxy Module
 */

import { Module } from '@nestjs/common';
import { StoresProxyController } from './stores-proxy.controller';
import { StoresProxyService } from './stores-proxy.service';

@Module({
  controllers: [StoresProxyController],
  providers: [StoresProxyService],
})
export class StoresProxyModule {}
