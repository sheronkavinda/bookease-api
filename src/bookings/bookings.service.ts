import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesService } from '../services/services.service';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enums/booking-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly servicesService: ServicesService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const service = await this.servicesService.findOne(
      createBookingDto.serviceId,
    );

    if (!service.isActive) {
      throw new BadRequestException(
        'Bookings cannot be created for an inactive service',
      );
    }

    this.validateBookingDate(createBookingDto.bookingDate);

    const existingBooking = await this.bookingsRepository.findOne({
      where: {
        serviceId: createBookingDto.serviceId,
        bookingDate: createBookingDto.bookingDate,
        bookingTime: createBookingDto.bookingTime,
      },
    });

    if (existingBooking && existingBooking.status !== BookingStatus.CANCELLED) {
      throw new ConflictException(
        'This service is already booked for the selected date and time',
      );
    }

    const booking = this.bookingsRepository.create({
      ...createBookingDto,
      customerName: createBookingDto.customerName.trim(),
      customerEmail: createBookingDto.customerEmail.toLowerCase().trim(),
      customerPhone: createBookingDto.customerPhone.trim(),
      notes: createBookingDto.notes?.trim(),
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  async findAll(query: BookingQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      queryBuilder.andWhere('booking.status = :status', {
        status: query.status,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          booking.customerName ILIKE :search OR
          booking.customerEmail ILIKE :search OR
          booking.customerPhone ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: {
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateStatus(
    id: string,
    updateBookingStatusDto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    const newStatus = updateBookingStatusDto.status;

    if (
      booking.status === BookingStatus.CANCELLED &&
      newStatus === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cancelled bookings cannot be marked as completed',
      );
    }

    booking.status = newStatus;

    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;

    return this.bookingsRepository.save(booking);
  }

  private validateBookingDate(bookingDate: string): void {
    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }
  }
}
