import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './entities/donation.entity';
import { Request } from '../requests/entities/request.entity';
import { User } from '../users/entities/user.entity';
import { RequestStatus, Urgency, BloodType } from '@pulse/shared';

/** Minimum confirmed donations required for automatic verification */
const VERIFICATION_THRESHOLD = 3;

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async recordDonation(
    userId: string,
    data: { donationDate: Date; donationCenter?: string; notes?: string },
  ): Promise<Donation> {
    const donationDate = new Date(data.donationDate);
    if (isNaN(donationDate.getTime())) {
      throw new BadRequestException('Invalid donation date');
    }
    if (donationDate > new Date()) {
      throw new BadRequestException('Donation date cannot be in the future');
    }

    // Enforce 56-day minimum interval between donations
    const lastDonation = await this.getLastDonationDate(userId);
    if (lastDonation) {
      if (donationDate <= lastDonation) {
        throw new BadRequestException(
          'Donation date must be after your most recent donation',
        );
      }
      const daysSinceLast = Math.floor(
        (donationDate.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLast < 56) {
        throw new BadRequestException(
          `Must wait at least 56 days between donations (${56 - daysSinceLast} days remaining)`,
        );
      }
    }

    const donation = this.donationRepository.create({
      userId,
      donationDate,
      donationCenter: data.donationCenter,
      notes: data.notes,
    });
    const saved = await this.donationRepository.save(donation);

    await this.checkAndUpdateVerification(userId);

    return saved;
  }

  /**
   * Auto-verify a donor once they reach the verification threshold.
   * Verified donors get priority in nearby donor matching results.
   */
  async checkAndUpdateVerification(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.isVerified) return user?.isVerified ?? false;

    const totalDonations = await this.donationRepository.count({ where: { userId } });
    if (totalDonations >= VERIFICATION_THRESHOLD) {
      user.isVerified = true;
      user.verifiedAt = new Date();
      await this.userRepository.save(user);
      return true;
    }
    return false;
  }

  async getDonationHistory(userId: string): Promise<Donation[]> {
    return this.donationRepository.find({
      where: { userId },
      order: { donationDate: 'DESC' },
    });
  }

  async getLastDonationDate(userId: string): Promise<Date | null> {
    const last = await this.donationRepository.findOne({
      where: { userId },
      order: { donationDate: 'DESC' },
    });
    return last?.donationDate ?? null;
  }

  async getDonationImpact(userId: string): Promise<{
    totalDonations: number;
    peopleHelped: number;
    urgentRequestsFulfilled: number;
    bloodTypesHelped: BloodType[];
    lastDonationDate: Date | null;
    nextEligibleDate: Date | null;
    isEligible: boolean;
    daysSinceLastDonation: number | null;
  }> {
    const ELIGIBILITY_DAYS = 56;

    const [totalDonations, lastDonationDate, completedRequests] =
      await Promise.all([
        this.donationRepository.count({ where: { userId } }),
        this.getLastDonationDate(userId),
        this.requestRepository.find({
          where: {
            acceptedDonorId: userId,
            status: RequestStatus.COMPLETED,
          },
          select: ['bloodType', 'urgency'],
        }),
      ]);

    const peopleHelped = completedRequests.length;

    const urgentRequestsFulfilled = completedRequests.filter(
      (r) => r.urgency === Urgency.URGENT || r.urgency === Urgency.CRITICAL,
    ).length;

    const bloodTypesHelped = [
      ...new Set(completedRequests.map((r) => r.bloodType)),
    ];

    let nextEligibleDate: Date | null = null;
    let isEligible = true;
    let daysSinceLastDonation: number | null = null;

    if (lastDonationDate) {
      const now = new Date();
      daysSinceLastDonation = Math.floor(
        (now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      isEligible = daysSinceLastDonation >= ELIGIBILITY_DAYS;
      if (!isEligible) {
        nextEligibleDate = new Date(lastDonationDate);
        nextEligibleDate.setDate(
          nextEligibleDate.getDate() + ELIGIBILITY_DAYS,
        );
      }
    }

    return {
      totalDonations,
      peopleHelped,
      urgentRequestsFulfilled,
      bloodTypesHelped,
      lastDonationDate,
      nextEligibleDate,
      isEligible,
      daysSinceLastDonation,
    };
  }
}
