import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { DonationCenter } from '../centers/entities/donation-center.entity';
import { City } from '../cities/entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonationCenter, City])],
  controllers: [SeedController],
})
export class SeedModule {}
