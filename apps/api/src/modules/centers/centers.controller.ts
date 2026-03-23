import { Controller, Get, Query } from '@nestjs/common';
import { CentersService } from './centers.service';
import { IsOptional, IsString, IsNumber, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class ListCentersQueryDto {
  @IsOptional() @IsString() @MinLength(1) city?: string;
}

class NearbyCentersQueryDto {
  @IsNumber() @Type(() => Number) latitude: number;
  @IsNumber() @Type(() => Number) longitude: number;
  @IsOptional() @IsNumber() @Type(() => Number) limit?: number;
}

@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Get()
  listCenters(@Query() query: ListCentersQueryDto) {
    return this.centersService.listCenters(query.city);
  }

  @Get('nearby')
  getNearbyCenters(@Query() query: NearbyCentersQueryDto) {
    return this.centersService.getNearbyCenters(
      query.latitude,
      query.longitude,
      query.limit,
    );
  }
}
