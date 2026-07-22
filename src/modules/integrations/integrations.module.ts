import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLog } from './entities/integration-log.entity.js';
import { Lead } from '../leads/entities/lead.entity.js';
import { Proposal } from '../proposals/entities/proposal.entity.js';
import { IntegrationsController } from './integrations.controller.js';
import { IntegrationsService } from './integrations.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { ServicesModule } from '../services/services.module.js';

import { Contact } from '../contacts/entities/contact.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([IntegrationLog, Lead, Proposal, Contact]),
    AuthModule,
    ServicesModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
