// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { CoursesModule } from './modules/courses/courses.module';
import { UsersModule } from './modules/users/users.module'; 
import { AuthModule } from './auth/auth.module';
import { ContactController } from './contact.controller'; 

// ✅ รวม Import ทั้ง 2 อันเข้าด้วยกัน
import { StudentsModule } from './modules/Our-students/students.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { importOrRequireFile } from 'typeorm/util/ImportUtils.js';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }), 

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',
    }),
    
    CoursesModule,
    UsersModule,
    AuthModule,
    
    // ✅ ใส่ Module ทั้งคู่ลงไปใน imports array
    StudentsModule, 
    PaymentsModule,
  ],
  controllers: [ContactController],
  providers: [],
})
export class AppModule {}