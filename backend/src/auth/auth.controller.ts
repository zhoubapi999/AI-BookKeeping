import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: CreateUserDto) {
    const user = await this.authService.validateUser(
      loginDto.phone,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException("手机号或密码错误");
    }
    return this.authService.login(user);
  }

  @Post("register")
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }
}
