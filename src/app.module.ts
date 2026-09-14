import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AtividadesOSModule } from './atividades-os/atividades-os.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogoAtividadesModule } from './catalogo-atividades/catalogo-atividades.module.js';
import { ChecklistModule } from './checklist/checklist.module.js';
import { CronService } from './cron/cron.service.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { EmailModule } from './email/email.module.js';
import { EpisModule } from './epis/epis.module.js';
import { EquipamentosModule } from './equipamentos/equipamentos.module.js';
import { EquipesModule } from './equipes/equipes.module.js';
import { ManutencoesModule } from './manutencoes/manutencoes.module.js';
import { MateriaisModule } from './materiais/materiais.module.js';
import { OrcamentosModule } from './orcamentos/orcamentos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PublicoModule } from './publico/publico.module.js';
import { RbacModule } from './rbac/rbac.module.js';
import { SeparacaoModule } from './separacao/separacao.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { WhatsAppService } from './whatsapp/whatsapp.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    EquipamentosModule,
    EpisModule,
    ManutencoesModule,
    MateriaisModule,
    OrcamentosModule,
    PublicoModule,
    RbacModule,
    UsuariosModule,
    CatalogoAtividadesModule,
    EquipesModule,
    AtividadesOSModule,
    ChecklistModule,
    SeparacaoModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, WhatsAppService, CronService],
})
export class AppModule {}
