import { UpdateSettingsDto as IUpdateSettingsDto } from "@app/types";
import { IsNumber, IsOptional } from "class-validator";

export class UpdateSettingsDto implements IUpdateSettingsDto {
  @IsNumber()
  @IsOptional()
  monthlyBudget: number;
}
