// src/modules/orders/orders.controller.ts
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseInterceptors, UploadedFile, BadRequestException, Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. สร้างคำสั่งซื้อ + อัปโหลดสลิป
  @Post()
  @UseInterceptors(FileInterceptor('slip', {
    storage: diskStorage({
      destination: './uploads/slips', // 📂 โฟลเดอร์เก็บรูป
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `slip-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png)'), false);
      }
      callback(null, true);
    },
  }))
  create(@Body() createOrderDto: CreateOrderDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('กรุณาแนบสลิปการโอนเงิน');
    }
    // หมายเหตุ: จริงๆ userId ควรดึงจาก Token (req.user.id) แต่ตอนนี้รับจาก Body ไปก่อนเพื่อทดสอบ
    const userId = createOrderDto['userId'] ? +createOrderDto['userId'] : 1; 
    
    return this.ordersService.create(createOrderDto, userId, file.filename);
  }

  // 2. ดูรายการสั่งซื้อทั้งหมด (สำหรับ Admin)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // 3. ดูรายการสั่งซื้อตาม ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  // 4. ดูรายการสั่งซื้อของ User คนนั้นๆ (สำหรับหน้า MyClassroom)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(+userId);
  }

  // 5. อัปเดตสถานะ (เช่น Admin กดอนุมัติ)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}