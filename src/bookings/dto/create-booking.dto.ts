import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Kamal Perera' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @ApiProperty({ example: 'kamal@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ example: '0771234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  customerPhone!: string;

  @ApiProperty({
    example: '00000000-0000-0000-0000-000000000000',
    description: 'Existing service UUID',
  })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({
    example: '2026-07-25',
    description: 'Booking date in YYYY-MM-DD format',
  })
  @IsDateString()
  bookingDate!: string;

  @ApiProperty({
    example: '10:30',
    description: 'Booking time in HH:mm format',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'bookingTime must be in HH:mm format',
  })
  bookingTime!: string;

  @ApiPropertyOptional({
    example: 'Please call before the appointment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}