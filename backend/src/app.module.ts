// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Modules
import { CoursesModule } from './modules/courses/courses.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    // 1. Config (สำหรับอ่านไฟล์ .env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Database (สังเกตว่าคุณใช้ Postgres ถ้าจะใช้ SQLite ให้แก้ตรงนี้)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // ⚠️ ถ้าคุณใช้ SQLite (ไฟล์) ให้เปลี่ยนเป็น 'sqlite'
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // ถ้าใช้ SQLite ให้ลบบรรทัด host, port, user, pass, db ออก แล้วใส่: database: 'database.sqlite' แทน
        
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Auto create tables (Dev only)
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }), 

    // 3. Serve Static Files (เปิดให้เข้าถึงรูปภาพผ่าน URL)
    ServeStaticModule.forRoot({
      // ใช้ process.cwd() จะชี้ไปที่ Root ของโปรเจกต์เสมอ (ปลอดภัยกว่า __dirname)
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads', 
    }),
    
    // 4. Feature Modules
    CoursesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}