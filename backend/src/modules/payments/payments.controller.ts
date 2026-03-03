// src/modules/payments/payments.controller.ts
// src/modules/payments/payments.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // =========================
  // USER: CREATE PAYMENT
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, dto);
  }

  // =========================
  // USER: MY CLASSROOM
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  findMyCourses(@Req() req) {
    return this.paymentsService.findMyCourses(req.user.id);
  }

  // =========================
  // ✅ ADMIN: GET ALL PAYMENTS (แก้ใหม่)
  // =========================
  // รวม findPending และ findAll ไว้ที่นี่ที่เดียว เพื่อแก้ปัญหา Route ชนกัน
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // =========================
  // ✅ ADMIN: APPROVE PAYMENT (Endpoint นี้ถูกต้องแล้ว)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(@Param('id') id: number) {
    return this.paymentsService.approve(id);
  }

  // =========================
  // ✅ ADMIN: REJECT PAYMENT (Endpoint นี้ถูกต้องแล้ว)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id') id: number) {
    return this.paymentsService.reject(id);
  }
}