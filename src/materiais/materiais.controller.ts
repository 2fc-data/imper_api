import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { TipoMaterial } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type {
  MaterialInputDto,
  MaterialMovimentoDto,
  MaterialUpdateDto,
} from './materiais.service.js';
import { MateriaisService } from './materiais.service.js';

interface RequestWithUser extends Request {
  user?: {
    id: number;
  };
}

@Controller('materiais')
@UseGuards(JwtAuthGuard)
export class MateriaisController {
  constructor(private readonly materiaisService: MateriaisService) {}

  @Get()
  async listar(@Query('q') q?: string, @Query('tipo') tipo?: TipoMaterial) {
    return this.materiaisService.listar({ q, tipo });
  }

  @Get('lookups')
  async lookups() {
    return this.materiaisService.lookups();
  }

  // --- CRUD Categorias Materiais ---

  @Get('lookups/categorias')
  async listarCategorias() {
    return this.materiaisService.listarCategorias();
  }

  @Post('lookups/categorias')
  async criarCategoria(
    @Body() body: { nome: string; descricao?: string; ordem?: number },
  ) {
    return this.materiaisService.criarCategoria(body);
  }

  @Put('lookups/categorias/:id')
  async atualizarCategoria(
    @Param('id') id: string,
    @Body() body: {
      nome?: string;
      descricao?: string;
      ativo?: boolean;
      ordem?: number;
    },
  ) {
    return this.materiaisService.atualizarCategoria(Number(id), body);
  }

  @Delete('lookups/categorias/:id')
  async desativarCategoria(@Param('id') id: string) {
    return this.materiaisService.desativarCategoria(Number(id));
  }

  // --- CRUD Subcategorias Materiais ---

  @Get('lookups/subcategorias')
  async listarSubcategorias() {
    return this.materiaisService.listarSubcategorias();
  }

  @Post('lookups/subcategorias')
  async criarSubcategoria(
    @Body() body: {
      categoriaId: number;
      nome: string;
      descricao?: string;
      ordem?: number;
    },
  ) {
    return this.materiaisService.criarSubcategoria(body);
  }

  @Put('lookups/subcategorias/:id')
  async atualizarSubcategoria(
    @Param('id') id: string,
    @Body() body: {
      nome?: string;
      descricao?: string;
      ativo?: boolean;
      ordem?: number;
    },
  ) {
    return this.materiaisService.atualizarSubcategoria(Number(id), body);
  }

  @Delete('lookups/subcategorias/:id')
  async desativarSubcategoria(@Param('id') id: string) {
    return this.materiaisService.desativarSubcategoria(Number(id));
  }

  // --- CRUD Marcas Materiais ---

  @Get('lookups/marcas')
  async listarMarcas() {
    return this.materiaisService.listarMarcas();
  }

  @Post('lookups/marcas')
  async criarMarca(@Body() body: { nome: string }) {
    return this.materiaisService.criarMarca(body);
  }

  @Put('lookups/marcas/:id')
  async atualizarMarca(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.materiaisService.atualizarMarca(Number(id), body);
  }

  @Delete('lookups/marcas/:id')
  async desativarMarca(@Param('id') id: string) {
    return this.materiaisService.desativarMarca(Number(id));
  }

  // --- CRUD Cores Materiais ---

  @Get('lookups/cores')
  async listarCores() {
    return this.materiaisService.listarCores();
  }

  @Post('lookups/cores')
  async criarCor(@Body() body: { nome: string }) {
    return this.materiaisService.criarCor(body);
  }

  @Put('lookups/cores/:id')
  async atualizarCor(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.materiaisService.atualizarCor(Number(id), body);
  }

  @Delete('lookups/cores/:id')
  async desativarCor(@Param('id') id: string) {
    return this.materiaisService.desativarCor(Number(id));
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.materiaisService.excluir(Number(id));
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.materiaisService.detalhar(Number(id));
  }

  @Post()
  async criar(@Body() dto: MaterialInputDto) {
    return this.materiaisService.criar(dto);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() dto: MaterialUpdateDto) {
    return this.materiaisService.atualizar(Number(id), dto);
  }

  @Post(':id/entrada')
  async registrarEntrada(
    @Param('id') id: string,
    @Body() dto: MaterialMovimentoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.materiaisService.registrarEntrada(
      Number(id),
      dto,
      req.user?.id,
    );
  }

  @Post(':id/saida')
  async registrarSaida(
    @Param('id') id: string,
    @Body() dto: MaterialMovimentoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.materiaisService.registrarSaida(Number(id), dto, req.user?.id);
  }
}
