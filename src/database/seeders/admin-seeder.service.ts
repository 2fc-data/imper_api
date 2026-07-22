import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
  }

  private async seedAdmin(): Promise<void> {
    try {
      const adminExists = await this.userRepo
        .createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.ADMIN })
        .getOne();

      if (adminExists) {
        this.logger.log('Admin user already exists, skipping seed.');
        return;
      }

      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const admin = this.userRepo.create({
        name: 'Administrador',
        email: 'admin@imper.local',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await this.userRepo.save(admin);

      this.logger.warn(
        '⚠️  DEV ONLY — Default admin user created:\n' +
          '   Email:    admin@imper.local\n' +
          '   Password: admin123\n' +
          '   Change this password in production!',
      );
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
