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
  // ✅ ADMIN: GET ALL PAYMENTS
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // =========================
  // ✅ ADMIN: APPROVE PAYMENT
  // =========================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(@Param('id') id: number) {
    return this.paymentsService.approve(id);
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
  // ✅ API ใหม่: ระงับสิทธิ์ขั้นเด็ดขาด (ครอบคลุมทั้งหมด)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch('user/:userId/course/:courseId/revoke')
  revokeCourseAccess(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.paymentsService.revokeCourseAccess(+userId, courseId);
  }

  // ==========================================
  // ✅ API สำหรับให้นักเรียนกดยืนยันตอนดูวิดีโอจบ
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post('complete-video')
  async completeVideo(
    @Req() req,
    @Body() body: { courseId: string; videoId: string }
  ) {
    // ใช้ req.user.id ให้ตรงกับระบบ Auth ปัจจุบันของคุณ
    return this.paymentsService.markVideoAsCompleted(req.user.id, body.courseId, body.videoId);
  }
}