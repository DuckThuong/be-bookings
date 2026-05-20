import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { AdminUserController } from '../controllers/admin-user.controller';
import { UserController } from '../controllers/user.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRepository } from '../repositories/user.repository';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TbBasicUser, TbInfoUser]), AuthModule],
  providers: [UserService, UserRepository, RolesGuard],
  controllers: [UserController, AdminUserController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
