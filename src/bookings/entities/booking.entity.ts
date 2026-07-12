import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceEntity } from '../../services/entities/service.entity';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  customerName!: string;

  @Column()
  customerEmail!: string;

  @Column({ length: 30 })
  customerPhone!: string;

  @Column('uuid')
  serviceId!: string;

  @ManyToOne(() => ServiceEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'serviceId' })
  service!: ServiceEntity;

  @Column({ type: 'date' })
  bookingDate!: string;

  @Column({ type: 'time' })
  bookingTime!: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
