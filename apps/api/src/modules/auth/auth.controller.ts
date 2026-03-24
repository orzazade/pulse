import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,20}$/, { message: 'phone must contain only digits, optionally prefixed with +' })
  phone: string;
}

class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  @Matches(/^\+?[0-9]{7,20}$/, { message: 'phone must contain only digits, optionally prefixed with +' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4,6}$/, { message: 'otp must be 4-6 digits' })
  otp: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refreshToken(@CurrentUser() user: User) {
    return this.authService.refreshToken(user.id);
  }
}
