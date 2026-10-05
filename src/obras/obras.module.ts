import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ObrasController } from './obras.controller.js';
import { ObrasService } from './obras.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ObrasController],
  providers: [ObrasService],
  exports: [ObrasService],
})
export class ObrasModule {}
