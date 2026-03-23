import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BloodType, RequestStatus, Urgency } from '@pulse/shared';
import { User } from '../../users/entities/user.entity';

@Entity('requests')
@Index(['status', 'bloodType'])
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'seeker_id' })
  seekerId: string;

  @ManyToOne(() => User, (user) => user.seekerRequests)
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType })
  bloodType: BloodType;

  @Column({ default: 1 })
  units: number;

  @Column({ type: 'enum', enum: Urgency })
  urgency: Urgency;

  @Column({ nullable: true })
  hospital: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index()
  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.OPEN })
  status: RequestStatus;

  @Column({ name: 'accepted_donor_id', nullable: true })
  acceptedDonorId: string;

  @ManyToOne(() => User, (user) => user.donorRequests, { nullable: true })
  @JoinColumn({ name: 'accepted_donor_id' })
  donor: User;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
