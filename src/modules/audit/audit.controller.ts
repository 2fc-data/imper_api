import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { TimelineFilterDto } from './dto/timeline-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../iam/decorators/require-permission.decorator.js';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission('leads:read')
  @ApiOperation({ summary: 'Listar logs de auditoria (filtros, paginação)' })
  findAll(@Query() filters: AuditFilterDto) {
    return this.auditService.findAll(filters);
  }

  @Get('timeline')
  @RequirePermission('leads:read')
  @ApiOperation({ summary: 'Timeline de atividades (audit + activities)' })
  getTimeline(@Query() filters: TimelineFilterDto) {
    return this.auditService.getTimeline(filters);
  }
}
