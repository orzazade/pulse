import { Controller, Post, UseGuards, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationCenter } from '../centers/entities/donation-center.entity';
import { City } from '../cities/entities/city.entity';
import { DONATION_CENTERS } from '../centers/centers.seed';
import { AZERBAIJAN_CITIES } from '../cities/cities.seed';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('seed')
@UseGuards(JwtAuthGuard)
export class SeedController {
  private readonly logger = new Logger(SeedController.name);

  constructor(
    @InjectRepository(DonationCenter)
    private readonly centerRepository: Repository<DonationCenter>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  @Post('run')
  async seed() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seeding is not allowed in production');
    }

    try {
      return await this.centerRepository.manager.transaction(async (manager) => {
        const results = { centers: 0, cities: 0 };

        // Seed cities
        const existingCities = await manager.count(City);
        if (existingCities === 0) {
          const cities = manager.create(City, AZERBAIJAN_CITIES);
          await manager.save(cities);
          results.cities = cities.length;
        }

        // Seed centers
        const existingCenters = await manager.count(DonationCenter);
        if (existingCenters === 0) {
          const centers = manager.create(DonationCenter, DONATION_CENTERS);
          await manager.save(centers);
          results.centers = centers.length;
        }

        return {
          message: 'Seed complete',
          inserted: results,
          skipped: {
            cities: existingCities > 0 ? 'already seeded' : null,
            centers: existingCenters > 0 ? 'already seeded' : null,
          },
        };
      });
    } catch (error) {
      this.logger.error('Seed operation failed', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Seed operation failed — rolled back');
    }
  }
}
