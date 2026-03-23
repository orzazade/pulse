import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

class RecordDonationDto {
  @IsDateString() donationDate: string;
  @IsOptional() @IsString() @MaxLength(200) donationCenter?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  recordDonation(@CurrentUser() user: User, @Body() dto: RecordDonationDto) {
    return this.donationsService.recordDonation(user.id, {
      donationDate: new Date(dto.donationDate),
      donationCenter: dto.donationCenter,
      notes: dto.notes,
    });
  }

  @Get('history')
  getDonationHistory(@CurrentUser() user: User) {
    return this.donationsService.getDonationHistory(user.id);
  }

  @Get('last-date')
  getLastDonationDate(@CurrentUser() user: User) {
    return this.donationsService.getLastDonationDate(user.id);
  }
}
