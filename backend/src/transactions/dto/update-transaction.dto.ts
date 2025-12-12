import { PartialType } from "@nestjs/mapped-types";
import { CreateTransactionDto } from "./create-transaction.dto";
import { UpdateTransactionDto as IUpdateTransactionDto } from "@app/types";

export class UpdateTransactionDto
  extends PartialType(CreateTransactionDto)
  implements IUpdateTransactionDto {}
