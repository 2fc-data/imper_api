import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigCategory } from './entities/config-category.entity.js';
import { ConfigKey } from './entities/config-key.entity.js';
import { ConfigValue } from './entities/config-value.entity.js';
import { ConfigurationService } from './configuration.service.js';
import { ConfigCacheService } from './config-cache.service.js';
import { ConfigurationController } from './configuration.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigCategory, ConfigKey, ConfigValue])],
  providers: [ConfigurationService, ConfigCacheService],
  controllers: [ConfigurationController],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
