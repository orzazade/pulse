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
} from 'class-validator';
import { Type } from 'class-transformer';
import { BloodType, UserMode } from '@pulse/shared';

class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsEnum(BloodType) bloodType?: BloodType;
  @IsOptional() @IsEnum(UserMode) mode?: UserMode;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  @IsOptional() @IsBoolean() locationGranted?: boolean;
  @IsOptional() @IsString() preferredDonationCenter?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}

class UpdatePushTokenDto {
  @IsString() pushToken: string;
}

class UpdateNotificationPrefsDto {
  @IsOptional() @IsBoolean() notifyRequestMatch?: boolean;
  @IsOptional() @IsBoolean() notifyRequestAccepted?: boolean;
  @IsOptional() @IsBoolean() notifyEligibility?: boolean;
}

class NearbyDonorsQueryDto {
  @IsEnum(BloodType) bloodType: BloodType;
  @IsNumber() @Type(() => Number) latitude: number;
  @IsNumber() @Type(() => Number) longitude: number;
  @IsOptional() @IsNumber() @Type(() => Number) radiusKm?: number;
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
