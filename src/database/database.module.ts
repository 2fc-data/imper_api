import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { AdminSeederService } from './seeders/admin-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AdminSeederService],
})
export class DatabaseModule {}
