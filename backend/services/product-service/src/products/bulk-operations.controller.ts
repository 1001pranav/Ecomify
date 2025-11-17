import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from './product.service';
import { CSVImportCommand } from './commands/csv-import.command';
import { CSVExportCommand } from './commands/csv-export.command';
import { BulkUpdateProductDto, BulkDeleteProductDto } from './dto/bulk-operations.dto';

/**
 * Bulk Operations Controller - Handles bulk product operations
 */
@Controller('products/bulk')
export class BulkOperationsController {
  constructor(
    private readonly productService: ProductService,
    private readonly csvImportCommand: CSVImportCommand,
    private readonly csvExportCommand: CSVExportCommand,
  ) {}

  /**
   * Bulk update products
   * POST /api/v1/products/bulk/update
   */
  @Post('update')
  @HttpCode(HttpStatus.OK)
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateProductDto) {
    return this.productService.bulkUpdate(bulkUpdateDto);
  }

  /**
   * Bulk delete products
   * POST /api/v1/products/bulk/delete
   */
  @Post('delete')
  @HttpCode(HttpStatus.OK)
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductDto) {
    return this.productService.bulkDelete(bulkDeleteDto);
  }

  /**
   * Import products from CSV
   * POST /api/v1/products/bulk/import
   * Body: { storeId: string, csvContent: string }
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importCSV(@Body() body: { storeId: string; csvContent: string }) {
    return this.csvImportCommand.execute(body.storeId, body.csvContent);
  }

  /**
   * Export products to CSV
   * GET /api/v1/products/bulk/export?storeId=xxx&productIds=id1,id2
   */
  @Get('export')
  async exportCSV(
    @Query('storeId') storeId: string,
    @Query('productIds') productIds?: string,
    @Res() res?: Response,
  ) {
    const ids = productIds ? productIds.split(',') : undefined;
    const csv = await this.csvExportCommand.execute(storeId, ids);

    if (res) {
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename="products-${Date.now()}.csv"`);
      res.send(csv);
    }

    return csv;
  }

  /**
   * Get CSV import template
   * GET /api/v1/products/bulk/template
   */
  @Get('template')
  getTemplate(@Res() res: Response) {
    const template = this.csvImportCommand.getTemplate();

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="product-import-template.csv"');
    res.send(template);
  }
}
