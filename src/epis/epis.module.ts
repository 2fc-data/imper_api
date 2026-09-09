import { Module } from '@nestjs/common';
import { EpisController } from './epis.controller.js';
import { EpisService } from './epis.service.js';

@Module({
  controllers: [EpisController],
  providers: [EpisService],
  exports: [EpisService],
})
export class EpisModule {}
