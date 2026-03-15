import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { UserCourse } from '../users/entities/user_course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Course, UserCourse])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}