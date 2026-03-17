// src/modules/users/users.controller.ts
import { 
  Controller, Get, Post, Body, Param, Delete, Patch, 
  UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException // 🟢 เพิ่ม UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express'; // 🟢 เพิ่ม Import สำหรับ Upload
import { diskStorage } from 'multer'; // 🟢 เพิ่ม Import
import { extname } from 'path'; // 🟢 เพิ่ม Import
import { UsersService } from './users.service';
import { memoryStorage } from 'multer'; 
import { uploadToSupabase } from '../../utils/supabase-upload.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('register')
  register(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('profile')
  getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub; 
    return this.usersService.getProfile(+userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(
    @Request() req: any, 
    @Body() updateData: { firstName: string; lastName: string; phone: string } // 🟢 แก้ให้รับค่าตรงกับ Frontend
  ) {
    const userId = req.user.id || req.user.sub;
    
    // 🟢 รวมชื่อและนามสกุลเข้าด้วยกันเพื่อเก็บลงฟิลด์ name (ถ้าในฐานข้อมูลคุณมีแค่ฟิลด์ name ฟิลด์เดียว)
    // หรือส่งไปให้ Service จัดการต่อได้เลย
    return this.usersService.updateProfile(+userId, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  changePassword(@Request() req: any, @Body() passwords: any) {
    const userId = req.user.id || req.user.sub;
    return this.usersService.changePassword(+userId, passwords);
  }

  // 🟢 ส่วนที่เพิ่มใหม่: API สำหรับอัปโหลดรูปโปรไฟล์
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-profile')
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: memoryStorage(),
  }))
  async uploadProfilePicture(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์รูปภาพ กรุณาแนบไฟล์มาด้วย');
    }

    const fileUrl = await uploadToSupabase(file, 'profiles');
    const userId = req.user.id || req.user.sub;
    
    
    return this.usersService.updateProfilePicture(+userId, fileUrl);
  }
  // ===============================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 🛒 API สำหรับการซื้อคอร์ส / เพิ่มคอร์สเข้า User
  @Post(':userId/add-course/:courseId')
  addCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { expiresAt?: string | null },
  ) {
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;
    return this.usersService.addCourseToUser(+userId, courseId, expiresAt);
  }

  // ❌ API สำหรับลบคอร์สแบบ manual
  @Delete(':userId/remove-course/:courseId')
  removeCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.usersService.removeCourseFromUser(+userId, courseId);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}