import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { BloodType, RequestStatus, Urgency, UserMode, getCompatibleDonorTypes } from '@pulse/shared';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async createRequest(
    seekerId: string,
    data: {
      bloodType: BloodType;
      units?: number;
      urgency: Urgency;
      hospital?: string;
      city?: string;
      notes?: string;
    },
  ): Promise<Request> {
    // Limit open requests per user to prevent abuse
    const openCount = await this.requestRepository.count({
      where: { seekerId, status: RequestStatus.OPEN },
    });
    if (openCount >= 5) {
      throw new BadRequestException('Maximum of 5 open requests allowed. Complete or cancel existing requests first.');
    }

    const request = this.requestRepository.create({
      seekerId,
      bloodType: data.bloodType,
      units: data.units ?? 1,
      urgency: data.urgency,
      hospital: data.hospital,
      city: data.city,
      notes: data.notes,
      status: RequestStatus.OPEN,
    });

    const saved = await this.requestRepository.save(request);

    // Queue notification to matching donors (best-effort — don't fail the request)
    try {
      await this.notificationQueue.add('notify-matching-donors', {
        requestId: saved.id,
        bloodType: data.bloodType,
        seekerId,
      });
    } catch (error) {
      this.logger.error(`Failed to queue donor notification for request ${saved.id}`, error instanceof Error ? error.stack : undefined);
    }

    return saved;
  }

  async getMyRequests(seekerId: string): Promise<Request[]> {
    return this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.donor', 'donor')
      .addSelect(['donor.id', 'donor.fullName', 'donor.bloodType', 'donor.city', 'donor.region'])
      .where('request.seeker_id = :seekerId', { seekerId })
      .orderBy('request.created_at', 'DESC')
      .limit(100)
      .getMany();
  }

  async getIncomingRequests(donorId: string): Promise<Request[]> {
    const donor = await this.userRepository.findOne({ where: { id: donorId } });
    if (!donor?.bloodType) return [];

    // Find open requests where this donor's blood type is compatible
    const compatibleTypes = getCompatibleDonorTypes(donor.bloodType as BloodType);

    if (compatibleTypes.length === 0) return [];

    return this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.seeker', 'seeker')
      .addSelect(['seeker.id', 'seeker.fullName', 'seeker.city', 'seeker.region'])
      .where('request.status = :status', { status: RequestStatus.OPEN })
      .andWhere('request.blood_type IN (:...types)', { types: compatibleTypes })
      .andWhere('request.seeker_id != :donorId', { donorId })
      .orderBy('request.created_at', 'DESC')
      .limit(100)
      .getMany();
  }

  async getRequestDetail(requestId: string): Promise<Request> {
    const request = await this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.seeker', 'seeker')
      .addSelect(['seeker.id', 'seeker.fullName', 'seeker.bloodType', 'seeker.city', 'seeker.region'])
      .leftJoin('request.donor', 'donor')
      .addSelect(['donor.id', 'donor.fullName', 'donor.bloodType', 'donor.city', 'donor.region'])
      .where('request.id = :requestId', { requestId })
      .getOne();

    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async acceptRequest(requestId: string, donorId: string): Promise<Request> {
    const request = await this.getRequestDetail(requestId);

    if (request.seekerId === donorId) {
      throw new BadRequestException('You cannot accept your own request');
    }

    if (request.status !== RequestStatus.OPEN) {
      throw new ConflictException(`Cannot accept request with status "${request.status}"`);
    }

    // Verify donor has a compatible blood type
    const donor = await this.userRepository.findOne({ where: { id: donorId } });
    if (!donor?.bloodType) {
      throw new BadRequestException('Your blood type must be set before accepting requests');
    }
    if (donor.mode === UserMode.SEEKER) {
      throw new BadRequestException('Only donors can accept blood requests');
    }
    const compatibleTypes = getCompatibleDonorTypes(request.bloodType);
    if (!compatibleTypes.includes(donor.bloodType)) {
      throw new BadRequestException('Your blood type is not compatible with this request');
    }

    // Atomic update with WHERE status=OPEN to prevent race condition
    // where two donors accept the same request simultaneously
    const acceptedAt = new Date();
    const result = await this.requestRepository.update(
      { id: requestId, status: RequestStatus.OPEN },
      { status: RequestStatus.ACCEPTED, acceptedDonorId: donorId, acceptedAt },
    );
    if (result.affected === 0) {
      throw new ConflictException('Request has already been accepted by another donor');
    }

    request.status = RequestStatus.ACCEPTED;
    request.acceptedDonorId = donorId;
    request.acceptedAt = acceptedAt;

    const saved = request;

    // Notify seeker that request was accepted (best-effort)
    try {
      await this.notificationQueue.add('request-accepted', {
        requestId: saved.id,
        seekerId: request.seekerId,
        donorId,
      });
    } catch (error) {
      this.logger.error(`Failed to queue acceptance notification for request ${saved.id}`, error instanceof Error ? error.stack : undefined);
    }

    return saved;
  }

  async declineRequest(requestId: string, donorId: string): Promise<Request> {
    const request = await this.getRequestDetail(requestId);

    if (request.status !== RequestStatus.ACCEPTED || request.acceptedDonorId !== donorId) {
      throw new BadRequestException('Cannot decline this request');
    }

    // Atomic update with WHERE status=ACCEPTED AND acceptedDonorId matches
    // to prevent race condition with concurrent cancel or complete
    const result = await this.requestRepository.update(
      { id: requestId, status: RequestStatus.ACCEPTED, acceptedDonorId: donorId },
      { status: RequestStatus.OPEN, acceptedDonorId: null, acceptedAt: null },
    );
    if (result.affected === 0) {
      throw new ConflictException('Request status changed before decline');
    }

    request.status = RequestStatus.OPEN;
    request.acceptedDonorId = null;
    request.acceptedAt = null;
    return request;
  }

  async completeRequest(requestId: string, seekerId: string): Promise<Request> {
    const request = await this.getRequestDetail(requestId);

    if (request.seekerId !== seekerId) {
      throw new BadRequestException('Only the seeker can complete a request');
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException(`Cannot complete request with status "${request.status}"`);
    }

    // Atomic update with WHERE status=ACCEPTED to prevent race condition
    const result = await this.requestRepository.update(
      { id: requestId, status: RequestStatus.ACCEPTED },
      { status: RequestStatus.COMPLETED },
    );
    if (result.affected === 0) {
      throw new ConflictException('Request status changed before completion');
    }

    request.status = RequestStatus.COMPLETED;
    return request;
  }

  async cancelRequest(requestId: string, seekerId: string): Promise<Request> {
    const request = await this.getRequestDetail(requestId);

    if (request.seekerId !== seekerId) {
      throw new BadRequestException('Only the seeker can cancel a request');
    }

    if (request.status !== RequestStatus.OPEN && request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException(`Cannot cancel request with status "${request.status}"`);
    }

    // Atomic update with WHERE status IN (OPEN, ACCEPTED) to prevent race condition
    const result = await this.requestRepository.update(
      { id: requestId, status: In([RequestStatus.OPEN, RequestStatus.ACCEPTED]) },
      { status: RequestStatus.CANCELLED },
    );
    if (result.affected === 0) {
      throw new ConflictException('Request status changed before cancellation');
    }

    request.status = RequestStatus.CANCELLED;
    return request;
  }
}
