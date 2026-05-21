import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbInfoUser } from './entities/user/info-user.entity';
import { TbBasicUser } from './entities/user/basic-user.entity';
import { AuthModule } from './modules/auth.module';
import { MasterDataModule } from './modules/master-data.module';
import { UserModule } from './modules/user.module';
import { CompanyModule } from './modules/company.module';
import { SalesModule } from './modules/sales.module';
import { CustomerModule } from './modules/customer.module';
import { ClientModule } from './modules/client.module';
import { CMSVerhicalModule } from './modules/CMS/CMS_verhical.module';
import { TbMasterData } from './entities/master-data.entity';
import { TbCompanyTrip } from './entities/company/company-trip.entity';
import { TbVerhical } from './entities/verhical.entity';
import { TbTrip } from './entities/trip.entity';
import { TbDriver } from './entities/driver.entity';
import { TbCompany } from './entities/company/company.entity';
import { TbTicket } from './entities/ticket.entity';
import { TbRoad } from './entities/road.entity';
import { TbSeat } from './entities/seat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQLHOST'),
        port: Number(configService.get('MYSQLPORT')),
        username: configService.get('MYSQLUSER'),
        password: configService.get('MYSQLPASSWORD'),
        database: configService.get('MYSQLDATABASE'),
        charset: 'utf8mb4',
        autoLoadEntities: true,
        synchronize: configService.get('TYPEORM_SYNC') === 'true',
        logging: configService.get('TYPEORM_LOGGING') === 'true',
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          connectTimeout: 60000,
        },
        entities: [
          TbInfoUser,
          TbBasicUser,
          TbMasterData,
          TbCompany,
          TbCompanyTrip,
          TbDriver,
          TbSeat,
          TbTrip,
          TbVerhical,
          TbRoad,
          TbTicket,
        ],
        migrations: [__dirname + '/migrations/**/*.migration.{ts,js}'],
        migrationsRun: false,
      }),
    }),

    AuthModule,
    MasterDataModule,
    UserModule,
    CompanyModule,
    SalesModule,
    CustomerModule,
    ClientModule,
    CMSVerhicalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
