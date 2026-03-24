import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Request } from '../../requests/entities/request.entity';
import { NotificationsService } from '../notifications.service';
import { NotificationType, getCompatibleDonorTypes, BloodType, UserMode } from '@pulse/shared';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly notificationsService: NotificationsService,
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
}
