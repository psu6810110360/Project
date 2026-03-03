import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  slipUrl: string;
}