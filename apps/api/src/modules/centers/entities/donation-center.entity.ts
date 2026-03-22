import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('donation_centers')
export class DonationCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Index()
  @Column()
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ nullable: true })
  hours: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
