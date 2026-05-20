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
import { TbMasterData } from './entities/master-data.entity';

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
        entities: [TbInfoUser, TbBasicUser, TbMasterData],
        migrations: [__dirname + '/migrations/**/*.migration.{ts,js}'],
        migrationsRun: false,
      }),
    }),

    AuthModule,
    MasterDataModule,
    UserModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
