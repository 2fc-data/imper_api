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
import { EquipamentosService } from './equipamentos.service.js';

@Controller('equipamentos')
@UseGuards(JwtAuthGuard)
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('statusId') statusId?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.equipamentosService.listar({
      q,
      statusId: statusId ? Number(statusId) : undefined,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
    });
  }

  @Get('lookups')
  async lookups() {
    return this.equipamentosService.lookups();
  }

  // --- Sub-rotas de Lookups ---

  @Get('lookups/categorias')
  async listarCategorias() {
    return this.equipamentosService.listarCategorias();
  }
  @Post('lookups/categorias')
  async criarCategoria(@Body() dto: any) {
    return this.equipamentosService.criarCategoria(dto);
  }
  @Put('lookups/categorias/:id')
  async atualizarCategoria(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarCategoria(Number(id), dto);
  }
  @Delete('lookups/categorias/:id')
  async desativarCategoria(@Param('id') id: string) {
    return this.equipamentosService.desativarCategoria(Number(id));
  }

  @Get('lookups/subcategorias')
  async listarSubcategorias() {
    return this.equipamentosService.listarSubcategorias();
  }
  @Post('lookups/subcategorias')
  async criarSubcategoria(@Body() dto: any) {
    return this.equipamentosService.criarSubcategoria(dto);
  }
  @Put('lookups/subcategorias/:id')
  async atualizarSubcategoria(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarSubcategoria(Number(id), dto);
  }
  @Delete('lookups/subcategorias/:id')
  async desativarSubcategoria(@Param('id') id: string) {
    return this.equipamentosService.desativarSubcategoria(Number(id));
  }

  @Get('lookups/marcas')
  async listarMarcas() {
    return this.equipamentosService.listarMarcas();
  }
  @Post('lookups/marcas')
  async criarMarca(@Body() dto: any) {
    return this.equipamentosService.criarMarca(dto);
  }
  @Put('lookups/marcas/:id')
  async atualizarMarca(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarMarca(Number(id), dto);
  }
  @Delete('lookups/marcas/:id')
  async desativarMarca(@Param('id') id: string) {
    return this.equipamentosService.desativarMarca(Number(id));
  }

  @Get('lookups/fornecedores')
  async listarFornecedores() {
    return this.equipamentosService.listarFornecedores();
  }
  @Post('lookups/fornecedores')
  async criarFornecedor(@Body() dto: any) {
    return this.equipamentosService.criarFornecedor(dto);
  }
  @Put('lookups/fornecedores/:id')
  async atualizarFornecedor(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarFornecedor(Number(id), dto);
  }
  @Delete('lookups/fornecedores/:id')
  async desativarFornecedor(@Param('id') id: string) {
    return this.equipamentosService.desativarFornecedor(Number(id));
  }

  @Get('lookups/localizacoes')
  async listarLocalizacoes() {
    return this.equipamentosService.listarLocalizacoes();
  }
  @Post('lookups/localizacoes')
  async criarLocalizacao(@Body() dto: any) {
    return this.equipamentosService.criarLocalizacao(dto);
  }
  @Put('lookups/localizacoes/:id')
  async atualizarLocalizacao(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarLocalizacao(Number(id), dto);
  }
  @Delete('lookups/localizacoes/:id')
  async desativarLocalizacao(@Param('id') id: string) {
    return this.equipamentosService.desativarLocalizacao(Number(id));
  }

  @Get('lookups/status')
  async listarStatus() {
    return this.equipamentosService.listarStatus();
  }
  @Post('lookups/status')
  async criarStatus(@Body() dto: any) {
    return this.equipamentosService.criarStatus(dto);
  }
  @Put('lookups/status/:id')
  async atualizarStatus(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarStatus(Number(id), dto);
  }
  @Delete('lookups/status/:id')
  async desativarStatus(@Param('id') id: string) {
    return this.equipamentosService.desativarStatus(Number(id));
  }

  @Get('lookups/estados-conservacao')
  async listarEstadosConservacao() {
    return this.equipamentosService.listarEstadosConservacao();
  }
  @Post('lookups/estados-conservacao')
  async criarEstadoConservacao(@Body() dto: any) {
    return this.equipamentosService.criarEstadoConservacao(dto);
  }
  @Put('lookups/estados-conservacao/:id')
  async atualizarEstadoConservacao(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarEstadoConservacao(Number(id), dto);
  }
  @Delete('lookups/estados-conservacao/:id')
  async desativarEstadoConservacao(@Param('id') id: string) {
    return this.equipamentosService.desativarEstadoConservacao(Number(id));
  }

  @Get('lookups/tipos-manutencao')
  async listarTiposManutencao() {
    return this.equipamentosService.listarTiposManutencao();
  }
  @Post('lookups/tipos-manutencao')
  async criarTipoManutencao(@Body() dto: any) {
    return this.equipamentosService.criarTipoManutencao(dto);
  }
  @Put('lookups/tipos-manutencao/:id')
  async atualizarTipoManutencao(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizarTipoManutencao(Number(id), dto);
  }
  @Delete('lookups/tipos-manutencao/:id')
  async desativarTipoManutencao(@Param('id') id: string) {
    return this.equipamentosService.desativarTipoManutencao(Number(id));
  }

  // --- Unidades de Medida ---

  @Get('lookups/unidades-medida')
  async listarUnidadesMedida() {
    return this.equipamentosService.listarUnidadesMedida();
  }
  @Post('lookups/unidades-medida')
  async criarUnidadeMedida(@Body() dto: { nome: string; ordem?: number }) {
    return this.equipamentosService.criarUnidadeMedida(dto);
  }
  @Put('lookups/unidades-medida/:id')
  async atualizarUnidadeMedida(
    @Param('id') id: string,
    @Body() dto: { nome?: string; ativo?: boolean; ordem?: number },
  ) {
    return this.equipamentosService.atualizarUnidadeMedida(Number(id), dto);
  }
  @Delete('lookups/unidades-medida/:id')
  async desativarUnidadeMedida(@Param('id') id: string) {
    return this.equipamentosService.desativarUnidadeMedida(Number(id));
  }

  // --- Rotas Principais ---

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.equipamentosService.detalhar(Number(id));
  }

  @Post()
  async criar(@Body() dto: any) {
    return this.equipamentosService.criar(dto);
  }

  @Put(':id')
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.equipamentosService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return this.equipamentosService.excluir(Number(id));
  }
}
