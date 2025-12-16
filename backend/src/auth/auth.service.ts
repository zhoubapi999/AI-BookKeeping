import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private jwtService: JwtService,
  ) { }

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
    const { phone, password, username: dtoUsername } = authDto;
    const existingUser = await this.usersService.findOneByPhone(phone);
    if (existingUser) {
      throw new HttpException(
        "该手机号已注册",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Use provided username or default to last 4 digits of phone
    const username = dtoUsername || phone.slice(-4);

    // Check if username already exists
    const existingUsername =
      await this.usersService.findOneByUsername(username);
    if (existingUsername) {
      throw new ConflictException("该昵称已存在");
    }

    // Generate random avatar using UI Avatars with random background
    const avatar = `https://ui-avatars.com/api/?name=${username}&background=random&length=4`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      phone,
      password: hashedPassword,
      username,
      avatar,
    });
    // Create default categories for the new user
    await this.categoriesService.createDefaults(String(user._id));

    return this.login(user as unknown as { phone: string; _id: string });
  }
}
