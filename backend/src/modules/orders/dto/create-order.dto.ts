// src/modules/orders/dto/create-order.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  courseId: number; // หรือ string แล้วแต่ว่า ID ของ Course นายเป็น type อะไร (น่าจะเป็น number)
  userId?: number; // รับชั่วคราวระหว่าง dev
}