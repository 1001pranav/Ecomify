import { Module } from '@nestjs/common';
import { ProductsProxyController } from './products-proxy.controller';
import { ProductsProxyService } from './products-proxy.service';

@Module({
  controllers: [ProductsProxyController],
  providers: [ProductsProxyService],
})
export class ProductsProxyModule {}
