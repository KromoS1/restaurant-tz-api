import { TableType, WalkInStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class WalkInCreateDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Количество гостей должно быть числом' })
  @Min(1, { message: 'Количество гостей должно быть больше 0' })
  guestCount: number;

  @IsOptional()
  @IsString({ message: 'Имя гостя должно быть строкой' })
  guestName?: string;

  @IsOptional()
  @IsString({ message: 'Номер телефона должен быть строкой' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Заметки должны быть строкой' })
  notes?: string;
}

export class WalkInSeatDto {
  @IsUUID('4', { message: 'ID столика должен быть валидным UUID' })
  tableId: string;

  @IsOptional()
  @IsString({ message: 'Заметки должны быть строкой' })
  notes?: string;
}

export class WalkInUpdateDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Количество гостей должно быть числом' })
  @Min(1, { message: 'Количество гостей должно быть больше 0' })
  guestCount?: number;

  @IsOptional()
  @IsString({ message: 'Имя гостя должно быть строкой' })
  guestName?: string;

  @IsOptional()
  @IsString({ message: 'Номер телефона должен быть строкой' })
  phone?: string;

  @IsOptional()
  @IsIn(['WAITING', 'SEATED', 'LEFT'], {
    message: 'Статус должен быть одним из: WAITING, SEATED, LEFT',
  })
  status?: WalkInStatus;

  @IsOptional()
  @IsString({ message: 'Заметки должны быть строкой' })
  notes?: string;
}

export class WaitingQueueCreateDto {
  @IsUUID('4', { message: 'ID walk-in гостя должен быть валидным UUID' })
  walkInId: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Количество гостей должно быть числом' })
  @Min(1, { message: 'Количество гостей должно быть больше 0' })
  guestCount: number;

  @IsOptional()
  @IsIn(['REGULAR', 'VIP', 'FAMILY'], {
    message:
      'Предпочтительный тип столика должен быть одним из: REGULAR, VIP, FAMILY',
  })
  preferredTableType?: TableType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Оценочное время ожидания должно быть числом' })
  @Min(0, { message: 'Время ожидания не может быть отрицательным' })
  estimatedWait?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Приоритет должен быть числом' })
  priority?: number;
}

export class WalkInIdDto {
  @IsUUID('4', { message: 'ID должен быть валидным UUID' })
  id: string;
}
