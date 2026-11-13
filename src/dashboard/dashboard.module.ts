import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { ObrasAnalyticsService } from './obras-analytics.service.js';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, ObrasAnalyticsService],
  exports: [DashboardService],
})
export class DashboardModule {}
