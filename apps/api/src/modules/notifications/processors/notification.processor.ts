import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';
import { NotificationsService } from '../notifications.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationType, getCompatibleDonorTypes, BloodType, UserMode, Urgency, RequestStatus } from '@pulse/shared';

/** Delay before next escalation re-notification, by urgency level (ms) */
const ESCALATION_DELAY_MS: Record<Urgency, number> = {
  [Urgency.CRITICAL]: 5 * 60 * 1000,
  [Urgency.URGENT]: 15 * 60 * 1000,
  [Urgency.NORMAL]: 30 * 60 * 1000,
  [Urgency.STANDARD]: 60 * 60 * 1000,
};

const MAX_ESCALATIONS = 3;

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly notificationsService: NotificationsService,
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  @Process('notify-matching-donors')
  async handleNotifyMatchingDonors(
    job: Job<{ requestId: string; bloodType: string; seekerId: string }>,
  ) {
    const { requestId, bloodType, seekerId } = job.data;

    if (!Object.values(BloodType).includes(bloodType as BloodType)) {
      this.logger.error(`Invalid bloodType "${bloodType}" in job ${job.id} for request ${requestId}`);
      return;
    }

    const compatibleTypes = getCompatibleDonorTypes(bloodType as BloodType);

    if (compatibleTypes.length === 0) return;

    const donors = await this.userRepository.find({
      where: {
        isAvailable: true,
        bloodType: In(compatibleTypes),
        mode: In([UserMode.DONOR, UserMode.BOTH]),
        notifyRequestMatch: true,
      },
    });

    for (const donor of donors) {
      if (donor.id === seekerId) continue;

      try {
        await this.notificationsService.createNotification({
          userId: donor.id,
          type: NotificationType.REQUEST_MATCH,
          title: 'Blood Request Match',
          body: `Someone needs ${bloodType} blood. Can you help?`,
          requestId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to create notification for donor ${donor.id} on request ${requestId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      // TODO: Send push notification via Expo
      if (donor.pushToken) {
        // await sendExpoPush(donor.pushToken, title, body)
      }
    }
  }

  @Process('request-accepted')
  async handleRequestAccepted(
    job: Job<{ requestId: string; seekerId: string; donorId: string }>,
  ) {
    const { requestId, seekerId } = job.data;

    try {
      await this.notificationsService.createNotification({
        userId: seekerId,
        type: NotificationType.REQUEST_ACCEPTED,
        title: 'Request Accepted',
        body: 'A donor has accepted your blood request!',
        requestId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create acceptance notification for seeker ${seekerId} on request ${requestId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    // TODO: Send push notification to seeker
  }

  @Process('escalate-request')
  async handleEscalateRequest(
    job: Job<{ requestId: string; bloodType: string; seekerId: string }>,
  ) {
    const { requestId, bloodType, seekerId } = job.data;

    // Check if request is still OPEN — if accepted/cancelled/completed, no escalation needed
    const request = await this.requestRepository.findOne({ where: { id: requestId } });
    if (!request || request.status !== RequestStatus.OPEN) {
      return;
    }

    if (request.escalationCount >= MAX_ESCALATIONS) {
      this.logger.log(`Request ${requestId} reached max escalations (${MAX_ESCALATIONS})`);
      return;
    }

    if (!Object.values(BloodType).includes(bloodType as BloodType)) {
      this.logger.error(`Invalid bloodType "${bloodType}" in escalation job ${job.id} for request ${requestId}`);
      return;
    }

    // Increment escalation count (after validation to avoid wasting slots on invalid data)
    await this.requestRepository.update(
      { id: requestId },
      { escalationCount: request.escalationCount + 1 },
    );

    const compatibleTypes = getCompatibleDonorTypes(bloodType as BloodType);
    if (compatibleTypes.length === 0) return;

    const donors = await this.userRepository.find({
      where: {
        isAvailable: true,
        bloodType: In(compatibleTypes),
        mode: In([UserMode.DONOR, UserMode.BOTH]),
        notifyRequestMatch: true,
      },
    });

    const escalationLevel = request.escalationCount + 1;
    for (const donor of donors) {
      if (donor.id === seekerId) continue;

      try {
        await this.notificationsService.createNotification({
          userId: donor.id,
          type: NotificationType.REQUEST_ESCALATED,
          title: 'Urgent: Blood Still Needed',
          body: `A ${bloodType} blood request has been waiting with no donor. Escalation ${escalationLevel}/${MAX_ESCALATIONS}.`,
          requestId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to create escalation notification for donor ${donor.id} on request ${requestId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    // Schedule next escalation if under max
    if (escalationLevel < MAX_ESCALATIONS) {
      try {
        const delay = ESCALATION_DELAY_MS[request.urgency] ?? ESCALATION_DELAY_MS[Urgency.STANDARD];
        await this.notificationQueue.add(
          'escalate-request',
          { requestId, bloodType, seekerId },
          { delay },
        );
      } catch (error) {
        this.logger.error(`Failed to schedule next escalation for request ${requestId}`, error instanceof Error ? error.stack : undefined);
      }
    }
  }
}
