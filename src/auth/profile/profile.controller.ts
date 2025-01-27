import {
  Controller,
  Get,
  Put,
  Body,
  Patch,
  UploadedFile,
  UseInterceptors,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../schema/user.schema';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { UserId } from '../decorators/param.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @UserId() userId: string,
  ): Promise<{ message: string; data: User }> {
    const user = await this.profileService.getProfile(userId);
    return { message: 'Profile retrieved successfully', data: user };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string; data: User }> {
    const user = await this.profileService.updateProfile(
      userId,
      updateProfileDto,
    );
    return { message: 'Profile updated successfully', data: user };
  }

  @Patch('/image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @HttpCode(HttpStatus.OK)
  async updateImageProfile(
    @UserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; data: User }> {
    const user = await this.profileService.updateImageProfile(userId, file);
    return { message: 'Profile image updated successfully', data: user };
  }

  @Delete('/image')
  @HttpCode(HttpStatus.OK)
  async deleteImageProfile(
    @UserId() userId: string,
  ): Promise<{ message: string; data: User }> {
    const user = await this.profileService.deleteImageProfile(userId);
    return { message: 'Profile image deleted successfully', data: user };
  }
}
