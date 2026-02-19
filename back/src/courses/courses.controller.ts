import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
    { name: 'instructorImage', maxCount: 1 },
  ], multerOptions))
  create(
    @Body() createCourseDto: any, // รับเป็น any เพื่อจัดการการ Parse ข้อมูล
    @UploadedFiles() files: any
  ) {
    this.prepareData(createCourseDto, files);
    return this.coursesService.create(createCourseDto);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'sampleVideo', maxCount: 1 },
    { name: 'instructorImage', maxCount: 1 },
  ], multerOptions))
  update(
    @Param('id') id: string, 
    @Body() updateCourseDto: any,
    @UploadedFiles() files: any
  ) {
    this.prepareData(updateCourseDto, files);
    return this.coursesService.update(id, updateCourseDto);
  }

  // ---------------------------------------------------------
  // 🌟 Helper Method: จัดการไฟล์และแปลง JSON (Clean Code)
  // ---------------------------------------------------------
  private prepareData(dto: any, files: any) {
    // 1. จัดการไฟล์พื้นฐาน
    if (files?.coverImage) dto.coverImageUrl = `/uploads/${files.coverImage[0].filename}`;
    if (files?.sampleVideo) dto.sampleVideoUrl = `/uploads/${files.sampleVideo[0].filename}`;
    if (files?.instructorImage) dto.instructorImageUrl = `/uploads/${files.instructorImage[0].filename}`;

    // 2. 🌟 เพิ่มตรงนี้: แปลง isActive จาก String เป็น Boolean
    if (dto.isActive !== undefined) {
      // ตรวจสอบว่าถ้าส่งมาเป็นตัวอักษร "true" หรือเลข 1 ให้เป็น true นอกนั้นเป็น false
      dto.isActive = (String(dto.isActive) === 'true' || dto.isActive === '1');
    }

    // 3. แปลง courseContents (JSON String -> Object)
    if (dto.courseContents && typeof dto.courseContents === 'string') {
      try {
        dto.courseContents = JSON.parse(dto.courseContents);
      } catch (e) {
        dto.courseContents = [];
      }
    }

    // 🌟 เช็คผลลัพธ์ผ่าน Terminal
    console.log('--- ตรวจสอบสถานะ Active ---');
    console.log('Value:', dto.isActive, ' | Type:', typeof dto.isActive);
  }

  @Get() findAll() { return this.coursesService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.coursesService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.coursesService.remove(id); }
}