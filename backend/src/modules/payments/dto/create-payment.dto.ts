// src/modules/payments/dto/create-payment.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsArray()
  courseIds: number[];

  @IsString()
  @IsNotEmpty()
  slipUrl: string;

  @IsNumber()
  totalPrice: number;
}