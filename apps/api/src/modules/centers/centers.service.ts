import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationCenter } from './entities/donation-center.entity';

@Injectable()
export class CentersService {
  constructor(
    @InjectRepository(DonationCenter)
    private readonly centerRepository: Repository<DonationCenter>,
  ) {}

  async listCenters(city?: string): Promise<DonationCenter[]> {
    if (city) {
      return this.centerRepository.find({ where: { city }, order: { name: 'ASC' } });
    }
    return this.centerRepository.find({ order: { city: 'ASC', name: 'ASC' } });
  }

  async getNearbyCenters(
    latitude: number,
    longitude: number,
    limit: number = 20,
  ): Promise<(DonationCenter & { distance: number })[]> {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid coordinates: latitude must be -90..90, longitude -180..180');
    }
    if (limit < 1 || limit > 100) {
      limit = Math.max(1, Math.min(100, limit));
    }

    const centers = await this.centerRepository
      .createQueryBuilder('center')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(center.latitude)) * cos(radians(center.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(center.latitude))))`,
        'distance',
      )
      .setParameters({ lat: latitude, lng: longitude })
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawAndEntities();

    return centers.entities.map((entity, i) => ({
      ...entity,
      distance: parseFloat(centers.raw[i]?.distance ?? '0') || 0,
    }));
  }
}
