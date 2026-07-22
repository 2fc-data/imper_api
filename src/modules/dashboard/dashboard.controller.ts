import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('pipeline')
  pipeline() {
    return this.dashboardService.pipeline();
  }

  @Get('revenue')
  revenue() {
    return this.dashboardService.revenue();
  }

  @Get('origins')
  origins() {
    return this.dashboardService.origins();
  }

  @Get('performers')
  performers() {
    return this.dashboardService.performers();
  }

  @Get('activities')
  activities() {
    return this.dashboardService.activities();
  }
}
