import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
// import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { CookieStrategy } from './cookie.strategy';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private cookieStrategy: CookieStrategy,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; data: { token: string } }> {
    const { email, password, confirmPassword, ...rest } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user._id });
    return { message: 'Sign up successfully', data: { token } };
  }

  async login(loginDto: LoginDto, res: Response): Promise<{ message: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ id: user._id });
    if (token) this.cookieStrategy.setCookie(res, token);
    return { message: 'Successfully login!' };
  }

  async logout(res: Response): Promise<{ message: string }> {
    this.cookieStrategy.clearCookie(res);
    return { message: 'Successfully logout!' };
  }
}
