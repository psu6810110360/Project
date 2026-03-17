// src/modules/courses/courses.controller.ts
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseInterceptors, UploadedFiles, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // ✅ ใช้แค่ memoryStorage
import { uploadToSupabase } from '../../utils/supabase-upload.util';
import { CoursesService } from './courses.service';

const multerOptions = {
  storage: memoryStorage()
};

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'sampleVideo', maxCount: 1 },
    { name: 'instructorImages', maxCount: 10 },
  ], multerOptions))
  async create(
    @Body() createCourseDto: any, 
    @UploadedFiles() files: any
  ) {
    await this.prepareData(createCourseDto, files);
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'sampleVideo', maxCount: 1 },
    { name: 'instructorImages', maxCount: 10 },
  ], multerOptions))
  async update(
    @Param('id') id: string, 
    @Body() updateCourseDto: any, 
    @UploadedFiles() files: any
  ) {
    await this.prepareData(updateCourseDto, files);
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  // ==========================================
  // ✅ API ใหม่: สำหรับอัปโหลดวิดีโอโดยเฉพาะ
  // ==========================================
  @Post('upload-video')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์วิดีโอ');
    }
    const fileUrl = await uploadToSupabase(file, 'courses/videos');
    return { url: fileUrl, message: 'อัปโหลดวิดีโอสำเร็จ' };
  }

  @Patch(':id/videos')
  updateCourseVideos(@Param('id') id: string, @Body() body: any) {
    return this.coursesService.update(id, { videos: body.videos });
  }

  // ==========================================
  // Private Helper 
  // ==========================================
  private async prepareData(dto: any, files: any) {
    // 1. อัปโหลดภาพปก
    if (files?.coverImage) {
      dto.coverImageUrl = await uploadToSupabase(files.coverImage[0], 'courses/covers');
    }
    // 2. อัปโหลดวิดีโอตัวอย่าง
    if (files?.sampleVideo) {
      dto.sampleVideoUrl = await uploadToSupabase(files.sampleVideo[0], 'courses/sample-videos');
    }
    // 3. จัดการรายชื่อและรูปผู้สอน
    if (dto.instructorNames) {
      const names = Array.isArray(dto.instructorNames) ? dto.instructorNames : [dto.instructorNames];

      const instructors: any[] = [];
      for (let i = 0; i < names.length; i++) {
        let imageUrl: string | null = null;
        if (files?.instructorImages?.[i]) {
          imageUrl = await uploadToSupabase(files.instructorImages[i], 'courses/instructors');
        }
        instructors.push({ name: names[i], imageUrl });
      }
      
      dto.instructors = instructors;
      delete dto.instructorNames;
    } // ✅ ลบโค้ดเก่าที่ตีกันออกไปแล้ว วงเล็บปิดถูกต้องตรงนี้

    // 4. จัดการ Boolean
    if (dto.isActive !== undefined) {
      dto.isActive = (String(dto.isActive) === 'true' || dto.isActive === '1');
    }

    // 5. แปลง Course Contents จาก String ให้เป็น JSON
    if (dto.courseContents && typeof dto.courseContents === 'string') {
      try {
        dto.courseContents = JSON.parse(dto.courseContents);
      } catch (e) {
        dto.courseContents = [];
      }
    }

    // 6. แปลง Videos จาก String ให้เป็น JSON
    if (dto.videos && typeof dto.videos === 'string') {
      try {
        dto.videos = JSON.parse(dto.videos);
      } catch (e) {
        dto.videos = [];
      }
    }
  }
}