import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ServicesModule } from './modules/services/services.module';
import { OrganizationModule } from './modules/organization/organization.module.js';
import { IamModule } from './modules/iam/iam.module.js';
import { ConfigurationModule } from './modules/configuration/configuration.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    LeadsModule,
    OpportunitiesModule,
    ActivitiesModule,
    DashboardModule,
    NotificationsModule,
    IntegrationsModule,
    ProposalsModule,
    ContactsModule,
    ServicesModule,
    OrganizationModule,
    IamModule,
    ConfigurationModule,
  ],
})
export class AppModule {}
