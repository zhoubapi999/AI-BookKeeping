import { CreateCategoryDto as ICreateCategoryDto } from "@app/types";
import { IsString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto implements ICreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(["income", "expense"])
  @IsNotEmpty()
  type: "income" | "expense";

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsOptional()
  ledgerId?: string;
}
