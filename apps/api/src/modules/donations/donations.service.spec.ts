import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';
import { Request } from '../requests/entities/request.entity';
import { RequestStatus, Urgency, BloodType } from '@pulse/shared';

describe('DonationsService', () => {
  let service: DonationsService;

  const mockDonationRepo = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRequestRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(Request), useValue: mockRequestRepo },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    jest.clearAllMocks();
  });

  describe('getDonationImpact', () => {
    const userId = 'user-123';

    it('should return zero impact for a user with no donations or requests', async () => {
      mockDonationRepo.count.mockResolvedValue(0);
      mockDonationRepo.findOne.mockResolvedValue(null);
      mockRequestRepo.find.mockResolvedValue([]);

      const result = await service.getDonationImpact(userId);

      expect(result).toEqual({
        totalDonations: 0,
        peopleHelped: 0,
        urgentRequestsFulfilled: 0,
        bloodTypesHelped: [],
        lastDonationDate: null,
        nextEligibleDate: null,
        isEligible: true,
        daysSinceLastDonation: null,
      });
    });

    it('should count completed requests and track blood types helped', async () => {
      mockDonationRepo.count.mockResolvedValue(3);
      mockDonationRepo.findOne.mockResolvedValue({
        donationDate: new Date('2026-01-01'),
      });
      mockRequestRepo.find.mockResolvedValue([
        { bloodType: BloodType.A_POSITIVE, urgency: Urgency.STANDARD },
        { bloodType: BloodType.O_NEGATIVE, urgency: Urgency.CRITICAL },
        { bloodType: BloodType.A_POSITIVE, urgency: Urgency.URGENT },
      ]);

      const result = await service.getDonationImpact(userId);

      expect(result.totalDonations).toBe(3);
      expect(result.peopleHelped).toBe(3);
      expect(result.urgentRequestsFulfilled).toBe(2);
      expect(result.bloodTypesHelped).toEqual(
        expect.arrayContaining([BloodType.A_POSITIVE, BloodType.O_NEGATIVE]),
      );
      expect(result.bloodTypesHelped).toHaveLength(2);
    });

    it('should calculate eligibility correctly when within 56 days', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);

      mockDonationRepo.count.mockResolvedValue(1);
      mockDonationRepo.findOne.mockResolvedValue({
        donationDate: recentDate,
      });
      mockRequestRepo.find.mockResolvedValue([]);

      const result = await service.getDonationImpact(userId);

      expect(result.isEligible).toBe(false);
      expect(result.daysSinceLastDonation).toBe(10);
      expect(result.nextEligibleDate).not.toBeNull();
    });

    it('should mark eligible when more than 56 days since last donation', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);

      mockDonationRepo.count.mockResolvedValue(2);
      mockDonationRepo.findOne.mockResolvedValue({
        donationDate: oldDate,
      });
      mockRequestRepo.find.mockResolvedValue([]);

      const result = await service.getDonationImpact(userId);

      expect(result.isEligible).toBe(true);
      expect(result.daysSinceLastDonation).toBe(60);
    });

    it('should query requests with correct filters', async () => {
      mockDonationRepo.count.mockResolvedValue(0);
      mockDonationRepo.findOne.mockResolvedValue(null);
      mockRequestRepo.find.mockResolvedValue([]);

      await service.getDonationImpact(userId);

      expect(mockRequestRepo.find).toHaveBeenCalledWith({
        where: {
          acceptedDonorId: userId,
          status: RequestStatus.COMPLETED,
        },
        select: ['bloodType', 'urgency'],
      });
    });
  });
});
