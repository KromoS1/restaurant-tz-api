import { ReservationStatus } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DateTransform } from 'src/common/decorator/dateTransform';

export class ReservationCreateDto {
  @IsString({ message: 'ID гостя должно быть строкой' })
  @IsUUID(4, { message: 'ID гостя должно быть валидным UUID' })
  guestId: string;

  @IsString({ message: 'ID столика должно быть строкой' })
  @IsUUID(4, { message: 'ID столика должно быть валидным UUID' })
  tableId: string;

  @IsInt({ message: 'Количество человек должно быть целым числом' })
  @Min(1, { message: 'Количество человек должно быть больше 0' })
  @Max(20, { message: 'Количество человек должно быть меньше 20' })
  @IsPositive({
    message: 'Количество человек должно быть положительным числом',
  })
  guestCount: number;

  @DateTransform()
  @IsDate({ message: 'Дата и время бронирования должно быть датой' })
  reservationDate: Date;

  @IsOptional()
  @IsInt({ message: 'Продолжительность в минутах должно быть целым числом' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'Особые пожелания должно быть строкой' })
  specialRequests?: string;

  @IsOptional()
  @IsString({ message: 'Внутренние заметки персонала должно быть строкой' })
  notes?: string;
}

export class ReservationUpdateDto {
  @IsOptional()
  @IsInt({ message: 'Количество человек должно быть целым числом' })
  @Min(1, { message: 'Количество человек должно быть больше 0' })
  @Max(20, { message: 'Количество человек должно быть меньше 20' })
  @IsPositive({
    message: 'Количество человек должно быть положительным числом',
  })
  guestCount?: number;

  @IsOptional()
  @DateTransform()
  @IsDate({ message: 'Дата и время бронирования должно быть датой' })
  reservationDate?: Date;

  @IsOptional()
  @IsInt({ message: 'Продолжительность в минутах должно быть целым числом' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'Особые пожелания должно быть строкой' })
  specialRequests?: string;

  @IsOptional()
  @IsString({ message: 'Внутренние заметки персонала должно быть строкой' })
  notes?: string;
}

export class ReservationChangeStatusDto {
  @IsEnum(ReservationStatus, {
    message:
      'Статус бронирования должен быть одним из: ' +
      Object.values(ReservationStatus).join(', '),
  })
  status: ReservationStatus;
}
