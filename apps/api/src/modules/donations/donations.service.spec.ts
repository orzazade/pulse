import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';
import { Request } from '../requests/entities/request.entity';
import { User } from '../users/entities/user.entity';
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

  const mockUserRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(Request), useValue: mockRequestRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
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

  describe('checkAndUpdateVerification', () => {
    const userId = 'user-123';

    it('should not verify a donor with fewer than 3 donations', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: userId, isVerified: false });
      mockDonationRepo.count.mockResolvedValue(2);

      const result = await service.checkAndUpdateVerification(userId);

      expect(result).toBe(false);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should verify a donor once they reach 3 donations', async () => {
      const user = { id: userId, isVerified: false, verifiedAt: null };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockDonationRepo.count.mockResolvedValue(3);

      const result = await service.checkAndUpdateVerification(userId);

      expect(result).toBe(true);
      expect(user.isVerified).toBe(true);
      expect(user.verifiedAt).toBeInstanceOf(Date);
      expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    });

    it('should skip verification if donor is already verified', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: userId, isVerified: true });

      const result = await service.checkAndUpdateVerification(userId);

      expect(result).toBe(true);
      expect(mockDonationRepo.count).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should return false if user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.checkAndUpdateVerification(userId);

      expect(result).toBe(false);
      expect(mockDonationRepo.count).not.toHaveBeenCalled();
    });

    it('should verify a donor with more than 3 donations', async () => {
      const user = { id: userId, isVerified: false, verifiedAt: null };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockDonationRepo.count.mockResolvedValue(7);

      const result = await service.checkAndUpdateVerification(userId);

      expect(result).toBe(true);
      expect(user.isVerified).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });
});
