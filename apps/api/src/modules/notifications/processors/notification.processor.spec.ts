import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { NotificationProcessor } from './notification.processor';
import { NotificationsService } from '../notifications.service';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';
import { Job } from 'bull';
import { BloodType, RequestStatus, Urgency, UserMode, NotificationType } from '@pulse/shared';

type EscalateJobData = { requestId: string; bloodType: string; seekerId: string };

function makeJob(data: EscalateJobData): Job<EscalateJobData> {
  return { data } as Job<EscalateJobData>;
}

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;

  const mockUserRepo = {
    find: jest.fn(),
  };

  const mockRequestRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Request), useValue: mockRequestRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: getQueueToken('notifications'), useValue: mockQueue },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    jest.clearAllMocks();
  });

  describe('handleEscalateRequest', () => {
    const jobData = {
      requestId: 'req-1',
      bloodType: BloodType.A_POSITIVE,
      seekerId: 'seeker-1',
    };

    it('should skip escalation if request is no longer OPEN', async () => {
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.ACCEPTED,
        escalationCount: 0,
        urgency: Urgency.URGENT,
      });

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockRequestRepo.update).not.toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should skip escalation if max escalations reached', async () => {
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.OPEN,
        escalationCount: 3,
        urgency: Urgency.CRITICAL,
      });

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockRequestRepo.update).not.toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should re-notify compatible donors and increment escalation count', async () => {
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.OPEN,
        escalationCount: 0,
        urgency: Urgency.URGENT,
      });
      mockRequestRepo.update.mockResolvedValue({ affected: 1 });

      const donor = {
        id: 'donor-1',
        isAvailable: true,
        bloodType: BloodType.A_POSITIVE,
        mode: UserMode.DONOR,
        notifyRequestMatch: true,
      };
      mockUserRepo.find.mockResolvedValue([donor]);
      mockNotificationsService.createNotification.mockResolvedValue({});
      mockQueue.add.mockResolvedValue({});

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockRequestRepo.update).toHaveBeenCalledWith(
        { id: 'req-1' },
        { escalationCount: 1 },
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        userId: 'donor-1',
        type: NotificationType.REQUEST_ESCALATED,
        title: 'Urgent: Blood Still Needed',
        body: expect.stringContaining('Escalation 1/3'),
        requestId: 'req-1',
      });
      // Should schedule next escalation since escalationLevel (1) < MAX (3)
      expect(mockQueue.add).toHaveBeenCalledWith(
        'escalate-request',
        { requestId: 'req-1', bloodType: BloodType.A_POSITIVE, seekerId: 'seeker-1' },
        { delay: 15 * 60 * 1000 },
      );
    });

    it('should not schedule next escalation at max level', async () => {
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.OPEN,
        escalationCount: 2,
        urgency: Urgency.CRITICAL,
      });
      mockRequestRepo.update.mockResolvedValue({ affected: 1 });
      mockUserRepo.find.mockResolvedValue([]);

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockRequestRepo.update).toHaveBeenCalledWith(
        { id: 'req-1' },
        { escalationCount: 3 },
      );
      // Should NOT schedule next escalation — this was the last one
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should skip seeker when re-notifying donors', async () => {
      mockRequestRepo.findOne.mockResolvedValue({
        id: 'req-1',
        status: RequestStatus.OPEN,
        escalationCount: 0,
        urgency: Urgency.STANDARD,
      });
      mockRequestRepo.update.mockResolvedValue({ affected: 1 });

      // Return the seeker as a "compatible donor" — should be skipped
      mockUserRepo.find.mockResolvedValue([
        { id: 'seeker-1', isAvailable: true, bloodType: BloodType.A_POSITIVE, mode: UserMode.BOTH },
      ]);
      mockQueue.add.mockResolvedValue({});

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should skip escalation if request not found', async () => {
      mockRequestRepo.findOne.mockResolvedValue(null);

      await processor.handleEscalateRequest(makeJob(jobData));

      expect(mockRequestRepo.update).not.toHaveBeenCalled();
    });
  });
});
