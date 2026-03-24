import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('donations')
@Index(['userId', 'donationDate'])
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.donations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'donation_date', type: 'timestamptz' })
  donationDate: Date;

  @Column({ name: 'donation_center', nullable: true })
  donationCenter: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
