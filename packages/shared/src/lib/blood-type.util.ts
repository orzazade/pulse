import { BloodType } from '../enums/blood-type.enum';

const COMPATIBILITY_MAP: Record<BloodType, BloodType[]> = {
  [BloodType.AB_POSITIVE]: [BloodType.A_POSITIVE, BloodType.A_NEGATIVE, BloodType.B_POSITIVE, BloodType.B_NEGATIVE, BloodType.AB_POSITIVE, BloodType.AB_NEGATIVE, BloodType.O_POSITIVE, BloodType.O_NEGATIVE],
  [BloodType.AB_NEGATIVE]: [BloodType.A_NEGATIVE, BloodType.B_NEGATIVE, BloodType.AB_NEGATIVE, BloodType.O_NEGATIVE],
  [BloodType.A_POSITIVE]: [BloodType.A_POSITIVE, BloodType.A_NEGATIVE, BloodType.O_POSITIVE, BloodType.O_NEGATIVE],
  [BloodType.A_NEGATIVE]: [BloodType.A_NEGATIVE, BloodType.O_NEGATIVE],
  [BloodType.B_POSITIVE]: [BloodType.B_POSITIVE, BloodType.B_NEGATIVE, BloodType.O_POSITIVE, BloodType.O_NEGATIVE],
  [BloodType.B_NEGATIVE]: [BloodType.B_NEGATIVE, BloodType.O_NEGATIVE],
  [BloodType.O_POSITIVE]: [BloodType.O_POSITIVE, BloodType.O_NEGATIVE],
  [BloodType.O_NEGATIVE]: [BloodType.O_NEGATIVE],
};

export function getCompatibleDonorTypes(recipientBloodType: BloodType): BloodType[] {
  return COMPATIBILITY_MAP[recipientBloodType] ?? [];
}

export function canDonate(donorType: BloodType, recipientType: BloodType): boolean {
  return getCompatibleDonorTypes(recipientType).includes(donorType);
}
