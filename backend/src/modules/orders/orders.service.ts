// src/modules/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Course) private coursesRepository: Repository<Course>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // ✅ สร้าง Order ใหม่ (สถานะ PENDING)
  async create(createOrderDto: CreateOrderDto, userId: number, slipFilename: string) {
    const { courseId } = createOrderDto;

    const course = await this.coursesRepository.findOne({ where: { id: String(courseId) } }); // ถ้า id เป็น string ก็ใช้ได้เลย
    if (!course) throw new NotFoundException('ไม่พบคอร์สเรียน');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const newOrder = this.ordersRepository.create({
      user,
      course,
      price: course.salePrice, // บันทึกราคา ณ ตอนซื้อ
      slipUrl: `/uploads/slips/${slipFilename}`,
      status: OrderStatus.PENDING, // เริ่มต้นรอตรวจสอบ
    });

    return await this.ordersRepository.save(newOrder);
  }

  // ✅ ดึงทั้งหมด (Admin)
  async findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ ดึงตาม User (MyClassroom)
  async findByUser(userId: number) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  // ✅ อัปเดตสถานะ (Admin กดอนุมัติ/ปฏิเสธ)
  async updateStatus(id: number, status: string) {
    const order = await this.findOne(id);
    
    if (status === 'APPROVED') {
        order.status = OrderStatus.APPROVED;
    } else if (status === 'REJECTED') {
        order.status = OrderStatus.REJECTED;
    }

    return await this.ordersRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return await this.ordersRepository.remove(order);
  }
}