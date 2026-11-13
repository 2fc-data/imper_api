import { Controller, Get, Query } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { dashboardObrasQuerySchema } from '../schemas/dashboard.js';
import { DashboardService } from './dashboard.service.js';
import type { DashboardObrasQueryInput } from './dto/dashboard.dto.js';
import { ObrasAnalyticsService } from './obras-analytics.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly obrasAnalyticsService: ObrasAnalyticsService,
  ) {}

  @Get('resumo')
  getResumo() {
    return this.dashboardService.getResumo();
  }

  @Get('obras')
  @Permissions('ver_obras')
  getObras(
    @Query(new ZodValidationPipe(dashboardObrasQuerySchema))
    query: DashboardObrasQueryInput,
  ) {
    return this.obrasAnalyticsService.obterDashboardObras(query);
  }
}
