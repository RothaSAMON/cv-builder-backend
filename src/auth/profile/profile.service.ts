import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { deleteFromS3, uploadToS3 } from 'src/utils/s3.utils';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateImageProfile(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadResult = await uploadToS3(file);

    user.imageProfile = uploadResult.Location;
    await user.save();

    return user;
  }

  async deleteImageProfile(userId: string): Promise<User> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const imageKey = user.imageProfile.split('/').pop();
    await deleteFromS3(`ProfileImage/${imageKey}`);

    user.imageProfile = null;
    await user.save();

    return user;
  }
}
