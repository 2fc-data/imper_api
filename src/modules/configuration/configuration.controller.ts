import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service.js';
import { UpdateConfigDto } from './dto/update-config.dto.js';

@ApiTags('Configuration')
@ApiBearerAuth()
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Get(':key')
  @ApiOperation({ summary: 'Get config value (with scope)' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async get(
    @Param('key') key: string,
    @Query('organizationId') organizationId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('userId') userId?: string,
  ) {
    const value = await this.configService.get(key, {
      organizationId,
      departmentId,
      userId,
    });
    return { key, value };
  }

  @Post(':key')
  @ApiOperation({ summary: 'Set config value (with scope)' })
  async set(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    await this.configService.set(key, dto.value, {
      organizationId: dto.organizationId,
      departmentId: dto.departmentId,
      userId: dto.userId,
    });
    return { message: `Config "${key}" updated successfully` };
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'List config categories' })
  async listCategories() {
    return this.configService.findAllCategories();
  }

  @Get('keys/list')
  @ApiOperation({ summary: 'List config keys' })
  @ApiQuery({ name: 'categoryId', required: false })
  async listKeys(@Query('categoryId') categoryId?: string) {
    return this.configService.findAllKeys(categoryId);
  }
}
