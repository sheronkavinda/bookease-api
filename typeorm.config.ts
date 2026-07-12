import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Booking } from './src/bookings/entities/booking.entity';
import { ServiceEntity } from './src/services/entities/service.entity';
import { User } from './src/users/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, ServiceEntity, Booking],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;