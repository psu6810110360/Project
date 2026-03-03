// src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Course])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // ⭐ เพิ่ม
})
export class PaymentsModule {}