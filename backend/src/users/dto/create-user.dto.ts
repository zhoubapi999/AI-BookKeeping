import { CreateUserDto as ICreateUserDto } from "@app/types";
import { IsNotEmpty, IsString, Length, IsOptional } from "class-validator";

export class CreateUserDto implements ICreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
