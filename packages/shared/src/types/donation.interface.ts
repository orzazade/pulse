export interface IDonation {
  id: string;
  userId: string;
  donationDate: Date;
  donationCenter?: string;
  notes?: string;
  createdAt: Date;
}
