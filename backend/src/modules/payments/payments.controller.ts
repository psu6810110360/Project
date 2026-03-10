// src/modules/payments/payments.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
  // ✅ ADMIN: GET ALL PAYMENTS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // =========================
  // ✅ ADMIN: APPROVE PAYMENT (พร้อม expiresAt optional)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id') id: number,
    @Body() body: { expiresAt?: string | null },
  ) {
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;
    return this.paymentsService.approve(id, expiresAt);
  }

  // =========================
  // ✅ ADMIN: REJECT PAYMENT
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id') id: number) {
    return this.paymentsService.reject(id);
  }

  // ==========================================
  // ✅ ADMIN: ลบ enrollment คอร์สของ user ออกทั้งหมด
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Delete('user/:userId/course/:courseId')
  deleteCourseEnrollment(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.paymentsService.deleteCourseEnrollment(+userId, courseId);
  }

  // ==========================================
  // ✅ API สำหรับให้นักเรียนกดยืนยันตอนดูวิดีโอจบ
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post('complete-video')
  async completeVideo(
    @Req() req,
    @Body() body: { courseId: string; videoId: string },
  ) {
    return this.paymentsService.markVideoAsCompleted(req.user.id, body.courseId, body.videoId);
  }
}