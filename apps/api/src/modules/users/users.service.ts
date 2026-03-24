import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BloodType, RequestStatus, UserMode, getCompatibleDonorTypes } from '@pulse/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'email' | 'bloodType' | 'mode' | 'city' | 'region' | 'latitude' | 'longitude' | 'locationGranted' | 'preferredDonationCenter' | 'isAvailable'>>,
  ): Promise<User> {
    const user = await this.getCurrentUser(userId);
    Object.assign(user, updates);
    return this.userRepository.save(user);
  }

  async updatePushToken(userId: string, pushToken: string): Promise<User> {
    const user = await this.getCurrentUser(userId);
    user.pushToken = pushToken;
    return this.userRepository.save(user);
  }

  async getNotificationPreferences(userId: string) {
    const user = await this.getCurrentUser(userId);
    return {
      notifyRequestMatch: user.notifyRequestMatch,
      notifyRequestAccepted: user.notifyRequestAccepted,
      notifyEligibility: user.notifyEligibility,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    prefs: Partial<Pick<User, 'notifyRequestMatch' | 'notifyRequestAccepted' | 'notifyEligibility'>>,
  ): Promise<User> {
    const user = await this.getCurrentUser(userId);
    Object.assign(user, prefs);
    return this.userRepository.save(user);
  }

  async getNearbyDonors(
    recipientBloodType: BloodType,
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<{ id: string; fullName: string; bloodType: BloodType; city: string; region: string; distance: number; isVerified: boolean }[]> {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid coordinates: latitude must be -90..90, longitude -180..180');
    }
    if (radiusKm <= 0 || radiusKm > 500) {
      radiusKm = Math.max(1, Math.min(500, radiusKm));
    }

    const compatibleTypes = getCompatibleDonorTypes(recipientBloodType);

    if (compatibleTypes.length === 0) return [];

    // Haversine distance calculation in SQL
    const donors = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(user.latitude)) * cos(radians(user.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(user.latitude))))`,
        'distance',
      )
      .where('user.is_available = :available', { available: true })
      .andWhere('user.blood_type IN (:...types)', { types: compatibleTypes })
      .andWhere('user.latitude IS NOT NULL')
      .andWhere('user.longitude IS NOT NULL')
      .andWhere('user.mode IN (:...modes)', { modes: [UserMode.DONOR, UserMode.BOTH] })
      .having('distance <= :radius', { radius: radiusKm })
      .setParameters({ lat: latitude, lng: longitude })
      .orderBy('user.is_verified', 'DESC')
      .addOrderBy('distance', 'ASC')
      .limit(50)
      .getRawAndEntities();

    return donors.entities.map((entity, i) => ({
      id: entity.id,
      fullName: entity.fullName,
      bloodType: entity.bloodType,
      city: entity.city,
      region: entity.region,
      distance: parseFloat(donors.raw[i]?.distance ?? '0') || 0,
      isVerified: entity.isVerified,
    }));
  }

  async getUserStats(userId: string): Promise<{ peopleHelped: number }> {
    const count = await this.userRepository.manager
      .createQueryBuilder()
      .from('requests', 'r')
      .where('r.accepted_donor_id = :userId', { userId })
      .andWhere('r.status = :status', { status: RequestStatus.COMPLETED })
      .getCount();

    return { peopleHelped: count };
  }
}
