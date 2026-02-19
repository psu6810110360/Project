import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsNotEmpty()
  originalPrice: number;

  @IsNumber()
  @IsNotEmpty()
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