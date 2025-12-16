import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "./dto/create-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CategoriesService } from "../categories/categories.service";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private categoriesService: CategoriesService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();
    await this.categoriesService.createDefaults(String(savedUser._id));
    return savedUser;
  }

  async findOneByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).exec();
  }

  async findOneByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.password) {
      throw new BadRequestException("未找到用户");
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException("旧密码错误");
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { success: true };
  }

  async updateProfile(
    userId: string,
    updateDto: { username?: string; avatar?: string },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException("未找到用户");
    }

    if (updateDto.username) {
      user.username = updateDto.username;
    }
    if (updateDto.avatar) {
      user.avatar = updateDto.avatar;
    }

    await user.save();
    return {
      id: String(user._id),
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
    };
  }
}
