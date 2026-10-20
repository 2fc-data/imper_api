import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { EpisService } from './epis.service.js';

@Controller('epis')
@UseGuards(JwtAuthGuard)
export class EpisController {
  constructor(private readonly episService: EpisService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.episService.listar({
      q,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
    });
  }

  @Get('lookups')
  async lookups() {
    return this.episService.lookups();
  }

  @Get('lookups/categorias')
  async listarCategorias() {
    return this.episService.listarCategorias();
  }

  @Get('lookups/subcategorias')
  async listarSubcategorias() {
    return this.episService.listarSubcategorias();
  }

  @Get('lookups/marcas')
  async listarMarcas() {
    return this.episService.listarMarcas();
  }

  @Get('lookups/fornecedores')
  async listarFornecedores() {
    return this.episService.listarFornecedores();
  }

  @Get('lookups/localizacoes')
  async listarLocalizacoes() {
    return this.episService.listarLocalizacoes();
  }

  @Get('lookups/cores')
  async listarCores() {
    return this.episService.listarCores();
  }

  @Get('lookups/tamanhos')
  async listarTamanhos() {
    return this.episService.listarTamanhos();
  }

  @Get('lookups/colaboradores')
  async listarColaboradores() {
    return this.episService.listarColaboradores();
  }

  @Get('lookups/unidades-medida')
  async listarUnidadesMedida() {
    return this.episService.listarUnidadesMedida();
  }

  @Post('lookups/categorias')
  @Permissions('gerenciar_catalogo')
  async criarCategoria(@Body() body: { nome: string; descricao?: string }) {
    return this.episService.criarCategoria(body);
  }

  @Put('lookups/categorias/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarCategoria(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarCategoria(Number(id), body);
  }

  @Delete('lookups/categorias/:id')
  @Permissions('gerenciar_catalogo')
  async desativarCategoria(@Param('id') id: string) {
    return this.episService.desativarCategoria(Number(id));
  }

  @Post('lookups/subcategorias')
  @Permissions('gerenciar_catalogo')
  async criarSubcategoria(
    @Body() body: { nome: string; descricao?: string; categoriaId: number },
  ) {
    return this.episService.criarSubcategoria(body);
  }

  @Put('lookups/subcategorias/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarSubcategoria(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarSubcategoria(Number(id), body);
  }

  @Delete('lookups/subcategorias/:id')
  @Permissions('gerenciar_catalogo')
  async desativarSubcategoria(@Param('id') id: string) {
    return this.episService.desativarSubcategoria(Number(id));
  }

  @Post('lookups/marcas')
  @Permissions('gerenciar_catalogo')
  async criarMarca(@Body() body: { nome: string }) {
    return this.episService.criarMarca(body);
  }

  @Put('lookups/marcas/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarMarca(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarMarca(Number(id), body);
  }

  @Delete('lookups/marcas/:id')
  @Permissions('gerenciar_catalogo')
  async desativarMarca(@Param('id') id: string) {
    return this.episService.desativarMarca(Number(id));
  }

  @Post('lookups/cores')
  @Permissions('gerenciar_catalogo')
  async criarCor(@Body() body: { nome: string }) {
    return this.episService.criarCor(body);
  }

  @Put('lookups/cores/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarCor(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarCor(Number(id), body);
  }

  @Delete('lookups/cores/:id')
  @Permissions('gerenciar_catalogo')
  async desativarCor(@Param('id') id: string) {
    return this.episService.desativarCor(Number(id));
  }

  @Post('lookups/tamanhos')
  @Permissions('gerenciar_catalogo')
  async criarTamanho(@Body() body: { nome: string }) {
    return this.episService.criarTamanho(body);
  }

  @Put('lookups/tamanhos/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarTamanho(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarTamanho(Number(id), body);
  }

  @Delete('lookups/tamanhos/:id')
  @Permissions('gerenciar_catalogo')
  async desativarTamanho(@Param('id') id: string) {
    return this.episService.desativarTamanho(Number(id));
  }

  @Post('lookups/localizacoes')
  @Permissions('gerenciar_catalogo')
  async criarLocalizacao(@Body() body: { nome: string; descricao?: string }) {
    return this.episService.criarLocalizacao(body);
  }

  @Put('lookups/localizacoes/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarLocalizacao(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarLocalizacao(Number(id), body);
  }

  @Delete('lookups/localizacoes/:id')
  @Permissions('gerenciar_catalogo')
  async desativarLocalizacao(@Param('id') id: string) {
    return this.episService.desativarLocalizacao(Number(id));
  }

  @Post('lookups/fornecedores')
  @Permissions('gerenciar_catalogo')
  async criarFornecedor(@Body() body: { nome: string; cnpj?: string }) {
    return this.episService.criarFornecedor(body);
  }

  @Put('lookups/fornecedores/:id')
  @Permissions('gerenciar_catalogo')
  async atualizarFornecedor(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarFornecedor(Number(id), body);
  }

  @Delete('lookups/fornecedores/:id')
  @Permissions('gerenciar_catalogo')
  async desativarFornecedor(@Param('id') id: string) {
    return this.episService.desativarFornecedor(Number(id));
  }

  @Get('proximo-codigo')
  @Permissions('gerenciar_epis')
  proximoCodigo() {
    return this.episService.proximoCodigo();
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.episService.detalhar(Number(id));
  }

  @Post()
  @Permissions('gerenciar_epis')
  async criar(@Body() dto: any) {
    return this.episService.criar(dto);
  }

  @Put(':id')
  @Permissions('gerenciar_epis')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.episService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  @Permissions('gerenciar_epis')
  async excluir(@Param('id') id: string) {
    return this.episService.excluir(Number(id));
  }
}
