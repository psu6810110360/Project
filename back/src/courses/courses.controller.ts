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
    { name: 'instructorImage', maxCount: 10 },
  ], multerOptions))
  create(
    @Body() createCourseDto: any, 
    @UploadedFiles() files: any
  ) {
    this.prepareData(createCourseDto, files);
    return this.coursesService.create(createCourseDto);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'coverImage', maxCount: 1 },
    { name: 'sampleVideo', maxCount: 1 },
    { name: 'instructorImage', maxCount: 10 },
  ], multerOptions))
  update(
    @Param('id') id: string, 
    @Body() updateCourseDto: any,
    @UploadedFiles() files: any
  ) {
    this.prepareData(updateCourseDto, files);
    return this.coursesService.update(id, updateCourseDto);
  }

  
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

    
    console.log('--- ตรวจสอบสถานะ Active ---');
    console.log('Value:', dto.isActive, ' | Type:', typeof dto.isActive);
  }

  @Get() findAll() { return this.coursesService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.coursesService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.coursesService.remove(id); }
}