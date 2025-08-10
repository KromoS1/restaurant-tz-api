import { TableStatus, TableType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class TableCreateDto {
  @IsInt({ message: 'Номер столика должен быть целым числом' })
  @IsPositive({ message: 'Номер столика должен быть положительным числом' })
  @Type(() => Number)
  number: number;

  @IsInt({ message: 'Минимальное количество мест должно быть целым числом' })
  @IsPositive({
    message: 'Минимальное количество мест должно быть положительным числом',
  })
  @Min(1, { message: 'Минимальное количество мест не может быть меньше 1' })
  @Type(() => Number)
  minSeats: number;

  @IsInt({ message: 'Максимальное количество мест должно быть целым числом' })
  @IsPositive({
    message: 'Максимальное количество мест должно быть положительным числом',
  })
  @Min(1, { message: 'Максимальное количество мест не может быть меньше 1' })
  @Max(20, { message: 'Максимальное количество мест не может быть больше 20' })
  @Type(() => Number)
  maxSeats: number;

  @IsEnum(TableType, {
    message:
      'Тип столика должен быть одним из: ' +
      Object.values(TableType).join(', '),
  })
  type: TableType;

  @IsOptional()
  @IsString({ message: 'Расположение должно быть строкой' })
  @Length(0, 100, { message: 'Расположение должно быть от 0 до 100 символов' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @Length(0, 500, { message: 'Описание должно быть от 0 до 500 символов' })
  description?: string;
}

export class TableUpdateDto {
  @IsOptional()
  @IsInt({ message: 'Номер столика должен быть целым числом' })
  @IsPositive({ message: 'Номер столика должен быть положительным числом' })
  @Type(() => Number)
  number: number;

  @IsOptional()
  @IsInt({ message: 'Минимальное количество мест должно быть целым числом' })
  @IsPositive({
    message: 'Минимальное количество мест должно быть положительным числом',
  })
  @Min(1, { message: 'Минимальное количество мест не может быть меньше 1' })
  @Type(() => Number)
  minSeats?: number;

  @IsOptional()
  @IsInt({ message: 'Максимальное количество мест должно быть целым числом' })
  @IsPositive({
    message: 'Максимальное количество мест должно быть положительным числом',
  })
  @Min(1, { message: 'Максимальное количество мест не может быть меньше 1' })
  @Max(20, { message: 'Максимальное количество мест не может быть больше 20' })
  @Type(() => Number)
  maxSeats?: number;

  @IsOptional()
  @IsEnum(TableType, {
    message:
      'Тип столика должен быть одним из: ' +
      Object.values(TableType).join(', '),
  })
  type?: TableType;

  @IsOptional()
  @IsString({ message: 'Расположение должно быть строкой' })
  @Length(0, 100, { message: 'Расположение должно быть от 0 до 100 символов' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @Length(0, 500, { message: 'Описание должно быть от 0 до 500 символов' })
  description?: string;
}

export class TableChangeStatusDto {
  @IsEnum(TableStatus, {
    message:
      'Статус столика должен быть одним из: ' +
      Object.values(TableStatus).join(', '),
  })
  status: TableStatus;
}

export class TableIdDto {
  @IsString({ message: 'ID столика должно быть строкой' })
  @IsUUID(4, { message: 'ID столика должно быть валидным UUID' })
  id: string;
}

export class TableUpdateStatusDto {
  @IsIn([TableStatus.AVAILABLE, TableStatus.MAINTENANCE], {
    message: 'Статус столика должен быть либо доступен, либо на обслуживании',
  })
  status: 'AVAILABLE' | 'MAINTENANCE';
}
