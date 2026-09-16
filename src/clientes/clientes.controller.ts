import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ClientesService } from './clientes.service.js';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async buscar(@Query('q') q?: string) {
    return this.clientesService.buscar(q ?? '');
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.clientesService.detalhar(Number(id));
  }

  @Post()
  async criar(@Body() dto: { nome: string; cpfCnpj?: string; telefone?: string; email?: string }) {
    return this.clientesService.criar(dto);
  }

  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: { nome?: string; cpfCnpj?: string; telefone?: string; email?: string },
  ) {
    return this.clientesService.atualizar(Number(id), dto);
  }
}