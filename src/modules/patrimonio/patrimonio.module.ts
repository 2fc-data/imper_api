import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity.js';
import { AssetAssignment } from './entities/asset-assignment.entity.js';
import { PatrimonioService } from './patrimonio.service.js';
import { PatrimonioController } from './patrimonio.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetAssignment])],
  controllers: [PatrimonioController],
  providers: [PatrimonioService],
  exports: [PatrimonioService],
})
export class PatrimonioModule {}
