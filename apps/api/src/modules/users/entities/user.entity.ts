import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BloodType, UserMode } from '@pulse/shared';
import { Request } from '../../requests/entities/request.entity';
import { Donation } from '../../donations/entities/donation.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType, nullable: true })
  bloodType: BloodType;

  @Column({ type: 'enum', enum: UserMode, nullable: true })
  mode: UserMode;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Index()
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Index()
  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ name: 'location_granted', default: false })
  locationGranted: boolean;

  @Column({ name: 'preferred_donation_center', nullable: true })
  preferredDonationCenter: string;

  @Index()
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'push_token', nullable: true })
  pushToken: string;

  @Column({ name: 'notify_request_match', default: true })
  notifyRequestMatch: boolean;

  @Column({ name: 'notify_request_accepted', default: true })
  notifyRequestAccepted: boolean;

  @Column({ name: 'notify_eligibility', default: true })
  notifyEligibility: boolean;

  @Column({ name: 'last_eligibility_reminder', type: 'timestamptz', nullable: true })
  lastEligibilityReminder: Date;

  @Index()
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Request, (request) => request.seeker)
  seekerRequests: Request[];

  @OneToMany(() => Request, (request) => request.donor)
  donorRequests: Request[];

  @OneToMany(() => Donation, (donation) => donation.user)
  donations: Donation[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
