import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { BadRequestException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from '../services/services.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './enums/booking-status.enum';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let bookingsService: BookingsService;

  const bookingsRepositoryMock = {
    findOne: jest.fn<
      () => Promise<{
        id: string;
        status: BookingStatus;
      } | null>
    >(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const servicesServiceMock = {
    findOne: jest.fn<
      () => Promise<{
        id: string;
        isActive: boolean;
      }>
    >(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingsRepositoryMock,
        },
        {
          provide: ServicesService,
          useValue: servicesServiceMock,
        },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(bookingsService).toBeDefined();
  });

  it('should reject a booking date in the past', async () => {
    servicesServiceMock.findOne.mockResolvedValue({
      id: 'service-id',
      isActive: true,
    });

    await expect(
      bookingsService.create({
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '0771234567',
        serviceId: '00000000-0000-0000-0000-000000000001',
        bookingDate: '2020-01-01',
        bookingTime: '10:30',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(bookingsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should reject bookings for an inactive service', async () => {
    servicesServiceMock.findOne.mockResolvedValue({
      id: 'service-id',
      isActive: false,
    });

    await expect(
      bookingsService.create({
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '0771234567',
        serviceId: '00000000-0000-0000-0000-000000000001',
        bookingDate: '2030-01-01',
        bookingTime: '10:30',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(bookingsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should reject a duplicate booking slot', async () => {
    servicesServiceMock.findOne.mockResolvedValue({
      id: 'service-id',
      isActive: true,
    });

    bookingsRepositoryMock.findOne.mockResolvedValue({
      id: 'existing-booking-id',
      status: BookingStatus.PENDING,
    });

    await expect(
      bookingsService.create({
        customerName: 'Test Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '0771234567',
        serviceId: '00000000-0000-0000-0000-000000000001',
        bookingDate: '2030-01-01',
        bookingTime: '10:30',
      }),
    ).rejects.toThrow(ConflictException);

    expect(bookingsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should not mark a cancelled booking as completed', async () => {
    const cancelledBooking = {
      id: 'booking-id',
      status: BookingStatus.CANCELLED,
    } as Booking;

    jest.spyOn(bookingsService, 'findOne').mockResolvedValue(cancelledBooking);

    const updateDto: UpdateBookingStatusDto = {
      status: BookingStatus.COMPLETED,
    };

    await expect(
      bookingsService.updateStatus('booking-id', updateDto),
    ).rejects.toThrow(BadRequestException);

    expect(bookingsRepositoryMock.save).not.toHaveBeenCalled();
  });
});
