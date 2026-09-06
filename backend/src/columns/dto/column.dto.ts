import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'Review' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 4000 })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateColumnDto {
  @ApiPropertyOptional({ example: 'QA & Review' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
