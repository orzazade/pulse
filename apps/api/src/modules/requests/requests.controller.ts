import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BloodType, Urgency } from '@pulse/shared';

class CreateRequestDto {
  @IsEnum(BloodType) bloodType: BloodType;
  @IsOptional() @IsNumber() @Min(1) @Max(10) @Type(() => Number) units?: number;
  @IsEnum(Urgency) urgency: Urgency;
  @IsOptional() @IsString() @MaxLength(200) hospital?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  createRequest(@CurrentUser() user: User, @Body() dto: CreateRequestDto) {
    return this.requestsService.createRequest(user.id, dto);
  }

  @Get('mine')
  getMyRequests(@CurrentUser() user: User) {
    return this.requestsService.getMyRequests(user.id);
  }

  @Get('incoming')
  getIncomingRequests(@CurrentUser() user: User) {
    return this.requestsService.getIncomingRequests(user.id);
  }

  @Get(':id')
  getRequestDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.getRequestDetail(id);
  }

  @Post(':id/accept')
  acceptRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.requestsService.acceptRequest(id, user.id);
  }

  @Post(':id/decline')
  declineRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.requestsService.declineRequest(id, user.id);
  }

  @Post(':id/complete')
  completeRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.requestsService.completeRequest(id, user.id);
  }

  @Post(':id/cancel')
  cancelRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.requestsService.cancelRequest(id, user.id);
  }
}
