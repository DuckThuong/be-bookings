import 'dotenv/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  charset: 'utf8mb4',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/**/*.migration.ts'],
  synchronize: false,
});

export default dataSource;
