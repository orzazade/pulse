import { BloodType, UserMode } from '../enums/blood-type.enum';
export interface IUser {
    id: string;
    phone: string;
    phoneVerified: boolean;
    email?: string;
    fullName?: string;
    bloodType?: BloodType;
    mode?: UserMode;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    locationGranted: boolean;
    preferredDonationCenter?: string;
    isAvailable: boolean;
    pushToken?: string;
    notifyRequestMatch: boolean;
    notifyRequestAccepted: boolean;
    notifyEligibility: boolean;
    lastEligibilityReminder?: Date;
    createdAt: Date;
}
