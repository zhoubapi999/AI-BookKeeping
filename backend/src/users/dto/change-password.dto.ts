import { ChangePasswordDto as IChangePasswordDto } from "@app/types";
import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto implements IChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
