import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const result = await this.authService.signUp(createUserDto);

    return res
      .cookie('token', result.data.token)
      .status(HttpStatus.CREATED)
      .json(result);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);

    return res.status(HttpStatus.ACCEPTED).json(result);
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    const result = await this.authService.logout(res);

    return res.status(HttpStatus.ACCEPTED).json(result);
  }
}
