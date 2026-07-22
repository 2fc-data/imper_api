import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity.js';
import { ProposalItem } from './entities/proposal-item.entity.js';
import { ProposalsController } from './proposals.controller.js';
import { ProposalsService } from './proposals.service.js';
import { ProposalPdfService } from './proposal-pdf.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, ProposalItem]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService, ProposalPdfService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
