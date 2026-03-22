import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(phone: string): Promise<{ message: string }> {
    if (!phone || phone.length < 7) {
      throw new BadRequestException('Invalid phone number');
    }

    // TODO: Integrate Firebase Auth for OTP sending
    // For development, any OTP is accepted
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    phone: string,
    otp: string,
  ): Promise<{ accessToken: string; user: User }> {
    if (!phone || !otp) {
      throw new BadRequestException('Phone and OTP are required');
    }

    // TODO: Verify OTP via Firebase Auth
    // For development, accept OTP "123456"
    if (process.env.NODE_ENV !== 'development' && otp !== '123456') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      user = this.userRepository.create({
        phone,
        phoneVerified: true,
      });
      user = await this.userRepository.save(user);
    } else {
      if (!user.phoneVerified) {
        user.phoneVerified = true;
        user = await this.userRepository.save(user);
      }
    }

    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
