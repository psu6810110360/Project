import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

// แยกตัวตั้งค่า Multer ออกมา เพื่อให้เรียกใช้ซ้ำได้ทั้งตอน Create และ Update
const multerOptions = {
  storage: diskStorage({
    destination: './uploads', // โฟลเดอร์ปลายทาง
    filename: (req, file, cb) => {
      // สุ่มชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ
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
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[], sampleVideo?: Express.Multer.File[], instructorImage?: Express.Multer.File[] }
  ) {

    if (files?.coverImage) {
      createCourseDto.coverImageUrl = `/uploads/${files.coverImage[0].filename}`;
    }
    if (files?.sampleVideo) {
      createCourseDto.sampleVideoUrl = `/uploads/${files.sampleVideo[0].filename}`;
    }
    if (files?.instructorImage) {
      createCourseDto.instructorImageUrl = `/uploads/${files.instructorImage[0].filename}`;
    }

    return this.coursesService.create(createCourseDto);
  }

 
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id); // สังเกตว่าไม่มีเครื่องหมาย + หน้า id แล้ว
  }

  
  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'sampleVideo', maxCount: 1 },
    { name: 'instructorImage', maxCount: 1 },
  ], multerOptions))
  update(
    @Param('id') id: string, 
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[], sampleVideo?: Express.Multer.File[], instructorImage?: Express.Multer.File[] }
  ) {

    if (files?.coverImage) {
      updateCourseDto.coverImageUrl = `/uploads/${files.coverImage[0].filename}`;
    }
    if (files?.sampleVideo) {
      updateCourseDto.sampleVideoUrl = `/uploads/${files.sampleVideo[0].filename}`;
    }
    if (files?.instructorImage) {
      updateCourseDto.instructorImageUrl = `/uploads/${files.instructorImage[0].filename}`;
    }
  

    console.log('--- ตรวจสอบข้อมูลจาก DTO ---');
    console.log('isActive:', updateCourseDto.isActive);
    console.log('Type:', typeof updateCourseDto.isActive);
    return this.coursesService.update(id, updateCourseDto);
  }

 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id); 
  }
}