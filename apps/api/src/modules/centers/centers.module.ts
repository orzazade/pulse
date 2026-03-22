import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';
import { DonationCenter } from './entities/donation-center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DonationCenter])],
  controllers: [CentersController],
  providers: [CentersService],
  exports: [CentersService],
})
export class CentersModule {}
