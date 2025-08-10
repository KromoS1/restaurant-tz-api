import { IsString, IsUUID } from 'class-validator';

export class IdDto {
  @IsString({ message: 'ID столика должно быть строкой' })
  @IsUUID(4, { message: 'ID столика должно быть валидным UUID' })
  id: string;
}
