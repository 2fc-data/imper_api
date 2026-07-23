import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { ContactFilterDto } from './dto/contact-filter.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RequirePermission } from '../iam/decorators/require-permission.decorator.js';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  @RequirePermission('contacts:write')
  @ApiOperation({ summary: 'Criar contato' })
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @Get()
  @RequirePermission('contacts:read')
  @ApiOperation({ summary: 'Listar contatos (filtros, paginação)' })
  findAll(@Query() filters: ContactFilterDto) {
    return this.contactsService.findAll(filters);
  }

  @Get(':id')
  @RequirePermission('contacts:read')
  @ApiOperation({ summary: 'Detalhe do contato' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('contacts:write')
  @ApiOperation({ summary: 'Atualizar contato' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('contacts:delete')
  @ApiOperation({ summary: 'Remover contato' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.remove(id);
  }
}
