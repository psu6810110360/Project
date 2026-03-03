import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Course } from '../courses/entities/course.entity'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Course) 
    private coursesRepository: Repository<Course>,
  ) {}

  // =========================
  // สมัครสมาชิก
  // =========================
  async create(userData: any) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้วครับ');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...result } = savedUser as any;
    return result;
  }

  // =========================
  // ดึง User ทั้งหมด
  // =========================
  findAll() {
    return this.usersRepository.find({
      relations: ['courses'],
    });
  }

  // =========================
  // ใช้ตอน Login
  // =========================
  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // =========================
  // ดึง User รายคน
  // =========================
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['courses'],
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');
    return user;
  }

  // =========================
  // เพิ่มคอร์สให้ User
  // =========================
  async addCourseToUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const course = await this.coursesRepository.findOneBy({
      id: courseId as any,
    });
    if (!course) throw new NotFoundException('ไม่พบหลักสูตร');

    if (!user.courses) user.courses = [];

    const alreadyHas = user.courses.some(
      (c) => String(c.id) === String(courseId),
    );

    if (!alreadyHas) {
      user.courses.push(course);
      await this.usersRepository.save(user);
    }

    return user;
  }

  // =========================
  // ลบคอร์สออกจาก User
  // =========================
  async removeCourseFromUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    if (user.courses) {
      user.courses = user.courses.filter(
        (c) => String(c.id) !== String(courseId),
      );
    }

    return await this.usersRepository.save(user);
  }

  // =========================
  // ลบ User (Admin)
  // =========================
  async removeUser(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}