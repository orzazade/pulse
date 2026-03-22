import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './entities/donation.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  async recordDonation(
    userId: string,
    data: { donationDate: Date; donationCenter?: string; notes?: string },
  ): Promise<Donation> {
    const donation = this.donationRepository.create({
      userId,
      donationDate: data.donationDate,
      donationCenter: data.donationCenter,
      notes: data.notes,
    });
    return this.donationRepository.save(donation);
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
}
