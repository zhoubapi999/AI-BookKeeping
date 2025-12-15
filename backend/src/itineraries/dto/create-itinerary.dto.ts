import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItineraryDto {
  @IsNotEmpty()
  @IsString()
  ledgerId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
