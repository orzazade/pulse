import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsEmail,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BloodType, UserMode } from '@pulse/shared';

class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(1) fullName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(BloodType) bloodType?: BloodType;
  @IsOptional() @IsEnum(UserMode) mode?: UserMode;
  @IsOptional() @IsString() @MinLength(1) city?: string;
  @IsOptional() @IsString() @MinLength(1) region?: string;
  @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  @IsOptional() @IsBoolean() locationGranted?: boolean;
  @IsOptional() @IsString() @MinLength(1) preferredDonationCenter?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}

class UpdatePushTokenDto {
  @IsString() @MinLength(1) pushToken: string;
}

class UpdateNotificationPrefsDto {
  @IsOptional() @IsBoolean() notifyRequestMatch?: boolean;
  @IsOptional() @IsBoolean() notifyRequestAccepted?: boolean;
  @IsOptional() @IsBoolean() notifyEligibility?: boolean;
}

class NearbyDonorsQueryDto {
  @IsEnum(BloodType) bloodType: BloodType;
  @IsNumber() @Min(-90) @Max(90) @Type(() => Number) latitude: number;
  @IsNumber() @Min(-180) @Max(180) @Type(() => Number) longitude: number;
  @IsOptional() @IsNumber() @Min(1) @Max(500) @Type(() => Number) radiusKm?: number;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/push-token')
  updatePushToken(@CurrentUser() user: User, @Body() dto: UpdatePushTokenDto) {
    return this.usersService.updatePushToken(user.id, dto.pushToken);
  }

  @Get('me/notification-preferences')
  getNotificationPreferences(@CurrentUser() user: User) {
    return this.usersService.getNotificationPreferences(user.id);
  }

  @Patch('me/notification-preferences')
  updateNotificationPreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    return this.usersService.updateNotificationPreferences(user.id, dto);
  }

  @Get('nearby-donors')
  getNearbyDonors(@Query() query: NearbyDonorsQueryDto) {
    return this.usersService.getNearbyDonors(
      query.bloodType,
      query.latitude,
      query.longitude,
      query.radiusKm,
    );
  }

  @Get('me/stats')
  getUserStats(@CurrentUser() user: User) {
    return this.usersService.getUserStats(user.id);
  }
}
