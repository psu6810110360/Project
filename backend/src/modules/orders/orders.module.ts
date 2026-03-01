// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ เพิ่ม
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity'; // ✅ เพิ่ม
import { Course } from '../courses/entities/course.entity'; // ✅ เพิ่ม
import { User } from '../users/entities/user.entity'; // ✅ เพิ่ม

@Module({
  imports: [TypeOrmModule.forFeature([Order, Course, User])], // ✅ จดทะเบียน Entity
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
