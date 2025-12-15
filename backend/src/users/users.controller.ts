import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import type { RequestWithUser } from "../types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async getProfile(@Request() req: RequestWithUser) {
    return this.usersService.findOneById(req.user.userId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("change-password")
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("update")
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateDto: { username?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(req.user.userId, updateDto);
  }
}
