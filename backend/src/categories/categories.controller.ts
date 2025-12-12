import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import type { RequestWithUser } from "../types";

@Controller("categories")
@UseGuards(AuthGuard("jwt"))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(req.user.userId, createCategoryDto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: RequestWithUser,
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      req.user.userId,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}
