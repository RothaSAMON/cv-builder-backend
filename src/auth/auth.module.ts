import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './jwt.strategy';
import { CookieStrategy } from './cookie.strategy';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES') },
      }),
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CookieStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
