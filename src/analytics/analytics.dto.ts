import { IsDateString, IsOptional } from 'class-validator';

export class GetAnalyticsDto {
  @IsDateString({}, { message: 'Дата должна быть в формате ISO 8601' })
  date: string;
}

export class GetAnalyticsRangeDto {
  @IsDateString(
    {},
    { message: 'Начальная дата должна быть в формате ISO 8601' },
  )
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'Конечная дата должна быть в формате ISO 8601' })
  endDate?: string;
}
