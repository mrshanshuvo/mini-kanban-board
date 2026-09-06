import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ example: 'Sprint 42 - Q3 Features' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Core feature development and bug fixes' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBoardDto {
  @ApiPropertyOptional({ example: 'Sprint 42 - Completed' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ShareBoardDto {
  @ApiProperty({ example: 'teammate@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'EDITOR', enum: ['EDITOR', 'VIEWER'] })
  @IsString()
  @IsNotEmpty()
  role: 'EDITOR' | 'VIEWER';
}
