// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ปรับ CORS นิดหน่อย เพื่อให้ Frontend (React) ยิง API เข้ามาได้แบบไม่มีปัญหาจุกจิก
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ระบบ Validation ของคุณตั้งมาดีมากครับ เก็บไว้ใช้ได้ยาวๆ เลย
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    //transformOptions: { enableImplicitConversion: true } 
  }));

  app.use(json({ limit: '1000mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(3000);
  console.log('🚀 Backend กำลังรันอยู่บนพอร์ต 3000');
}
bootstrap();