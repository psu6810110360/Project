// src/modules/payments/payments.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Patch } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ===============================
  // ✅ Upload slip (LOCAL)
  // ===============================
  @Post('upload-slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'slips');

          // ✅ สร้างโฟลเดอร์ถ้ายังไม่มี
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const unique =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadSlip(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File upload failed');
    }

    return {
      slipUrl: `/uploads/slips/${file.filename}`, // ✅ path ตรงจริง
    };
  }

  // ===============================
  // ✅ User create payment
  // ===============================
  @Post()
  createPayment(
    @Body('userId') userId: number,
    @Body('courseIds') courseIds: string[],
    @Body('slipUrl') slipUrl: string,
  ) {
    return this.paymentsService.createPayments(
      userId,
      courseIds,
      slipUrl,
    );
  }

  @Get('admin')
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentsService.findByUser(userId);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.approvePayment(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.rejectPayment(id);
  }

  @Patch('admin/:id/status')
  updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
  if (status === 'APPROVED') {
    return this.paymentsService.approvePayment(id);
  }

  if (status === 'REJECTED') {
    return this.paymentsService.rejectPayment(id);
  }

  throw new BadRequestException('Invalid status');
}
}