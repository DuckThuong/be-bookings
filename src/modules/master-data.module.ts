import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from '../controllers/master-data.controller';
import { TbMasterData } from '../entities/master-data.entity';
import { MasterDataRepository } from '../repositories/master-data.repository';
import { MasterDataService } from '../services/master-data.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TbMasterData]), AuthModule],
  providers: [MasterDataService, MasterDataRepository],
  controllers: [MasterDataController],
  exports: [MasterDataService],
})
export class MasterDataModule {}
