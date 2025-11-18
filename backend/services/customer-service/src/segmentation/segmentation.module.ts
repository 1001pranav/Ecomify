import { Module } from '@nestjs/common';
import { SegmentationController } from './segmentation.controller';
import { SegmentationService } from './segmentation.service';
import { SimpleConditionStrategy } from './strategies/simple-condition.strategy';

@Module({
  controllers: [SegmentationController],
  providers: [SegmentationService, SimpleConditionStrategy],
  exports: [SegmentationService],
})
export class SegmentationModule {}
