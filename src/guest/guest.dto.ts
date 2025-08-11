import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class GuestCreateDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(1, 100, { message: 'Имя должно быть от 1 до 100 символов' })
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== null && value !== '')
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Заметки должно быть строкой' })
  @Length(0, 500, { message: 'Заметки должно быть от 0 до 500 символов' })
  notes?: string;
}

export class GuestUpdateDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(1, 100, { message: 'Имя должно быть от 1 до 100 символов' })
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== null && value !== '')
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Заметки должно быть строкой' })
  @Length(0, 500, { message: 'Заметки должно быть от 0 до 500 символов' })
  notes?: string;
}
