import { Module } from '@nestjs/common';
import { ServicosAdminController } from './servicos-admin.controller.js';
import { ServicosAdminService } from './servicos-admin.service.js';

@Module({
  controllers: [ServicosAdminController],
  providers: [ServicosAdminService],
  exports: [ServicosAdminService],
})
export class ServicosAdminModule {}
