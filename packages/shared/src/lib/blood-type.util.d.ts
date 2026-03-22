import { BloodType } from '../enums/blood-type.enum';
export declare function getCompatibleDonorTypes(recipientBloodType: BloodType): BloodType[];
export declare function canDonate(donorType: BloodType, recipientType: BloodType): boolean;
