import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  originalPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  salePrice: number;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  sampleVideoUrl?: string;

  @IsString()
  @IsOptional()
  instructorName?: string;

  @IsString()
  @IsOptional()
  instructorImageUrl?: string;
}