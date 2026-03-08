// src/modules/courses/courses.controller.ts
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseInterceptors, UploadedFiles, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    }
  })
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
  create(
    @Body() createCourseDto: any, 
    @UploadedFiles() files: any
  ) {
    this.prepareData(createCourseDto, files);
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
  update(
    @Param('id') id: string, 
    @Body() updateCourseDto: any, 
    @UploadedFiles() files: any
  ) {
    this.prepareData(updateCourseDto, files);
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  // ==========================================
  // ✅ API ใหม่: สำหรับอัปโหลดวิดีโอโดยเฉพาะ (ลดภาระ Controller หลัก)
  // ==========================================
  @Post('upload-video')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์วิดีโอ');
    }
    // คืนค่า URL ของไฟล์กลับไปให้ Frontend ไปใช้งานต่อ
    return {
      url: `/uploads/${file.filename}`,
      message: 'อัปโหลดวิดีโอสำเร็จ'
    };
  }

  @Patch(':id/videos')
  updateCourseVideos(@Param('id') id: string, @Body() body: any) {
    // โยน { videos: [...] } เข้า Service โดยตรง ข้ามระบบดักจับไฟล์ทุกอย่าง
    return this.coursesService.update(id, { videos: body.videos });
  }

  // ==========================================
  // Private Helper (ของเดิม)
  // ==========================================
  private prepareData(dto: any, files: any) {
    if (files?.coverImage) dto.coverImageUrl = `/uploads/${files.coverImage[0].filename}`;
    if (files?.sampleVideo) dto.sampleVideoUrl = `/uploads/${files.sampleVideo[0].filename}`;
    if (dto.instructorNames) {
      const names = Array.isArray(dto.instructorNames) ? dto.instructorNames : [dto.instructorNames];
      dto.instructors = names.map((name, index) => {
        return {
          name: name,
          imageUrl: files?.instructorImages?.[index] 
            ? `/uploads/${files.instructorImages[index].filename}` 
            : null
        };
      });
      delete dto.instructorNames;
    }

    if (dto.isActive !== undefined) {
      dto.isActive = (String(dto.isActive) === 'true' || dto.isActive === '1');
    }

    if (dto.courseContents && typeof dto.courseContents === 'string') {
      try {
        dto.courseContents = JSON.parse(dto.courseContents);
      } catch (e) {
        dto.courseContents = [];
      }
    }

    // ✅ [เพิ่มตรงนี้] แปลงข้อมูล videos จาก String กลับเป็น Array ก่อนเซฟลง Database
    if (dto.videos && typeof dto.videos === 'string') {
      try {
        dto.videos = JSON.parse(dto.videos);
      } catch (e) {
        dto.videos = [];
      }
    }
  }
}
