import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationCenter } from '../centers/entities/donation-center.entity';
import { City } from '../cities/entities/city.entity';
import { DONATION_CENTERS } from '../centers/centers.seed';
import { AZERBAIJAN_CITIES } from '../cities/cities.seed';

@Controller('seed')
export class SeedController {
  constructor(
    @InjectRepository(DonationCenter)
    private readonly centerRepository: Repository<DonationCenter>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  @Post('run')
  async seed() {
    const results = { centers: 0, cities: 0 };

    // Seed cities
    const existingCities = await this.cityRepository.count();
    if (existingCities === 0) {
      const cities = this.cityRepository.create(AZERBAIJAN_CITIES);
      await this.cityRepository.save(cities);
      results.cities = cities.length;
    }

    // Seed centers
    const existingCenters = await this.centerRepository.count();
    if (existingCenters === 0) {
      const centers = this.centerRepository.create(DONATION_CENTERS);
      await this.centerRepository.save(centers);
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
  }
}
