import { Module } from '@nestjs/common';
import { MateriaisController } from './materiais.controller.js';
import { MateriaisService } from './materiais.service.js';

@Module({
  controllers: [MateriaisController],
  providers: [MateriaisService],
  exports: [MateriaisService],
})
export class MateriaisModule {}
