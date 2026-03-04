import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  course?: string;
  
  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}