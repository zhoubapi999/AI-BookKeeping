import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    phone: string,
    pass: string,
  ): Promise<{ phone: string; _id: string } | null> {
    const user = await this.usersService.findOneByPhone(phone);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const userObj = user.toObject() as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = userObj;
      return result as { phone: string; _id: string };
    }
    return null;
  }

  login(user: { phone: string; _id: string }) {
    const payload = { phone: user.phone, sub: user._id };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async register(authDto: CreateUserDto) {
    const { phone, password } = authDto;
    const existingUser = await this.usersService.findOneByPhone(phone);
    if (existingUser) {
      throw new UnauthorizedException("Phone number already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      phone,
      password: hashedPassword,
    });
    return this.login(user as unknown as { phone: string; _id: string });
  }
}
