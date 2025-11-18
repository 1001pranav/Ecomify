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
import { SegmentationService } from './segmentation.service';
import { CreateSegmentDto, UpdateSegmentDto } from './dto/segment.dto';

/**
 * Segmentation Controller
 * Exposes REST API endpoints for customer segmentation
 */
@Controller('segments')
export class SegmentationController {
  constructor(private readonly segmentationService: SegmentationService) {}

  /**
   * POST /api/v1/segments
   * Create a new segment
   */
  @Post()
  async createSegment(@Body() dto: CreateSegmentDto) {
    return this.segmentationService.createSegment(dto);
  }

  /**
   * GET /api/v1/segments/:id
   * Get segment by ID
   */
  @Get(':id')
  async getSegment(@Param('id') id: string) {
    return this.segmentationService.getSegment(id);
  }

  /**
   * GET /api/v1/segments
   * List segments for a store
   */
  @Get()
  async listSegments(@Query('storeId') storeId: string) {
    return this.segmentationService.listSegments(storeId);
  }

  /**
   * PATCH /api/v1/segments/:id
   * Update segment
   */
  @Patch(':id')
  async updateSegment(
    @Param('id') id: string,
    @Body() dto: UpdateSegmentDto,
  ) {
    return this.segmentationService.updateSegment(id, dto);
  }

  /**
   * DELETE /api/v1/segments/:id
   * Delete segment
   */
  @Delete(':id')
  async deleteSegment(@Param('id') id: string) {
    return this.segmentationService.deleteSegment(id);
  }

  /**
   * POST /api/v1/segments/:id/refresh
   * Refresh segment memberships
   */
  @Post(':id/refresh')
  async refreshSegment(@Param('id') id: string) {
    return this.segmentationService.updateSegmentMemberships(id);
  }

  /**
   * GET /api/v1/segments/:id/customers
   * Get customers in segment
   */
  @Get(':id/customers')
  async getSegmentCustomers(@Param('id') id: string) {
    return this.segmentationService.getSegmentCustomers(id);
  }
}
