import { BloodType, RequestStatus, Urgency } from '../enums/blood-type.enum';
export interface IRequest {
    id: string;
    seekerId: string;
    bloodType: BloodType;
    units: number;
    urgency: Urgency;
    hospital?: string;
    city?: string;
    notes?: string;
    status: RequestStatus;
    acceptedDonorId?: string;
    acceptedAt?: Date;
    createdAt: Date;
}
