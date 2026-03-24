import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

    // TODO: Integrate Firebase Auth for production OTP verification
    if (process.env.NODE_ENV === 'development') {
      // Dev-only backdoor: accept hardcoded OTP for testing
      if (otp !== '123456') {
        throw new UnauthorizedException('Invalid OTP');
      }
    } else {
      // Production: reject all OTPs until Firebase Auth is integrated
      throw new UnauthorizedException('OTP verification is not configured for this environment');
    }

    const user = await this.findOrCreateUser(phone);

    try {
      const payload = { sub: user.id, phone: user.phone };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken, user };
    } catch (error) {
      this.logger.error('Failed to sign JWT token', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Authentication failed — please try again');
    }
  }

  private async findOrCreateUser(phone: string): Promise<User> {
    try {
      const existing = await this.userRepository.findOne({ where: { phone } });

      if (!existing) {
        const user = this.userRepository.create({ phone, phoneVerified: true });
        return this.userRepository.save(user);
      }

      if (!existing.phoneVerified) {
        existing.phoneVerified = true;
        return this.userRepository.save(existing);
      }

      return existing;
    } catch (error) {
      this.logger.error(`Failed to upsert user for phone ***${phone.slice(-4)}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Authentication failed — please try again');
    }
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    let user: User | null;
    try {
      user = await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      this.logger.error(`Failed to look up user ${userId}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Could not refresh token — please try again');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      const payload = { sub: user.id, phone: user.phone };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } catch (error) {
      this.logger.error('Failed to sign JWT token', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Could not refresh token — please try again');
    }
  }
}
