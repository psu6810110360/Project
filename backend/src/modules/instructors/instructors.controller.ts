import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile,Patch } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, cb) => {
      
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `instructor-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body('name') name: string,
    @Body('bio') bio: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
   
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    return this.instructorsService.create(name, bio, imageUrl);
  }

  
  @Get()
  findAll() {
    return this.instructorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(id);

  }
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `instructor-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('bio') bio: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
  
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    return this.instructorsService.update(id, name, bio, imageUrl);
  }
}