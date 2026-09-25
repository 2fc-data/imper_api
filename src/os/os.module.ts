import { Module } from '@nestjs/common';
import { OsController } from './os.controller.js';
import { OsService } from './os.service.js';

@Module({
  controllers: [OsController],
  providers: [OsService],
  exports: [OsService],
})
export class OsModule {}
