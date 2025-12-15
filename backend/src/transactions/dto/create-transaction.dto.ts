import { CreateTransactionDto as ICreateTransactionDto } from "@app/types";
import {
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from "class-validator";

export class CreateTransactionDto implements ICreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(["income", "expense"])
  @IsNotEmpty()
  type: "income" | "expense";

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsString()
  @IsOptional()
  ledgerId?: string;

  @IsString()
  @IsOptional()
  payerId?: string;

  @IsOptional()
  beneficiaryIds?: string[];

  @IsOptional()
  autoMember?: boolean;
}
