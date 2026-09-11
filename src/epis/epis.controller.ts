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
  async criarCategoria(@Body() body: { nome: string; descricao?: string }) {
    return this.episService.criarCategoria(body);
  }

  @Put('lookups/categorias/:id')
  async atualizarCategoria(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarCategoria(Number(id), body);
  }

  @Delete('lookups/categorias/:id')
  async desativarCategoria(@Param('id') id: string) {
    return this.episService.desativarCategoria(Number(id));
  }

  @Post('lookups/subcategorias')
  async criarSubcategoria(
    @Body() body: { nome: string; descricao?: string; categoriaId: number },
  ) {
    return this.episService.criarSubcategoria(body);
  }

  @Put('lookups/subcategorias/:id')
  async atualizarSubcategoria(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarSubcategoria(Number(id), body);
  }

  @Delete('lookups/subcategorias/:id')
  async desativarSubcategoria(@Param('id') id: string) {
    return this.episService.desativarSubcategoria(Number(id));
  }

  @Post('lookups/marcas')
  async criarMarca(@Body() body: { nome: string }) {
    return this.episService.criarMarca(body);
  }

  @Put('lookups/marcas/:id')
  async atualizarMarca(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarMarca(Number(id), body);
  }

  @Delete('lookups/marcas/:id')
  async desativarMarca(@Param('id') id: string) {
    return this.episService.desativarMarca(Number(id));
  }

  @Post('lookups/cores')
  async criarCor(@Body() body: { nome: string }) {
    return this.episService.criarCor(body);
  }

  @Put('lookups/cores/:id')
  async atualizarCor(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarCor(Number(id), body);
  }

  @Delete('lookups/cores/:id')
  async desativarCor(@Param('id') id: string) {
    return this.episService.desativarCor(Number(id));
  }

  @Post('lookups/tamanhos')
  async criarTamanho(@Body() body: { nome: string }) {
    return this.episService.criarTamanho(body);
  }

  @Put('lookups/tamanhos/:id')
  async atualizarTamanho(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarTamanho(Number(id), body);
  }

  @Delete('lookups/tamanhos/:id')
  async desativarTamanho(@Param('id') id: string) {
    return this.episService.desativarTamanho(Number(id));
  }

  @Post('lookups/localizacoes')
  async criarLocalizacao(@Body() body: { nome: string; descricao?: string }) {
    return this.episService.criarLocalizacao(body);
  }

  @Put('lookups/localizacoes/:id')
  async atualizarLocalizacao(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarLocalizacao(Number(id), body);
  }

  @Delete('lookups/localizacoes/:id')
  async desativarLocalizacao(@Param('id') id: string) {
    return this.episService.desativarLocalizacao(Number(id));
  }

  @Post('lookups/fornecedores')
  async criarFornecedor(@Body() body: { nome: string; cnpj?: string }) {
    return this.episService.criarFornecedor(body);
  }

  @Put('lookups/fornecedores/:id')
  async atualizarFornecedor(
    @Param('id') id: string,
    @Body() body: { nome?: string; ativo?: boolean },
  ) {
    return this.episService.atualizarFornecedor(Number(id), body);
  }

  @Delete('lookups/fornecedores/:id')
  async desativarFornecedor(@Param('id') id: string) {
    return this.episService.desativarFornecedor(Number(id));
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.episService.detalhar(Number(id));
  }

  @Post()
  async criar(@Body() dto: any) {
    return this.episService.criar(dto);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.episService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.episService.excluir(Number(id));
  }
}
