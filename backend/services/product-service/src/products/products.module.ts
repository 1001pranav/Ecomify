import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { BulkOperationsController } from './bulk-operations.controller';
import { CSVImportCommand } from './commands/csv-import.command';
import { CSVExportCommand } from './commands/csv-export.command';

@Module({
  controllers: [ProductController, BulkOperationsController],
  providers: [ProductService, ProductRepository, CSVImportCommand, CSVExportCommand],
  exports: [ProductService, ProductRepository],
})
export class ProductsModule {}
