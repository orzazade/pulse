/**
 * Blood Type Compatibility Utility
 *
 * Implements medical blood donation compatibility rules.
 * A seeker with blood type X should see donors who can donate to them.
 */

// All 8 valid blood types
export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

/**
 * Compatibility map: for each blood type, lists which blood types can donate TO it.
 * Key = recipient blood type, Value = array of compatible donor blood types
 */
const COMPATIBILITY_MAP: Record<BloodType, BloodType[]> = {
  // AB+ is universal recipient - can receive from all types
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  // AB- can receive from negative types only
  "AB-": ["A-", "B-", "AB-", "O-"],
  // A+ can receive from A and O types
  "A+": ["A+", "A-", "O+", "O-"],
  // A- can receive from A- and O-
  "A-": ["A-", "O-"],
  // B+ can receive from B and O types
  "B+": ["B+", "B-", "O+", "O-"],
  // B- can receive from B- and O-
  "B-": ["B-", "O-"],
  // O+ can receive from O types only
  "O+": ["O+", "O-"],
  // O- is universal donor but can only receive from O-
  "O-": ["O-"],
};

/**
 * Get the blood types that can donate to a specific recipient blood type.
 *
 * @param recipientBloodType - The blood type of the person needing blood
 * @returns Array of blood types that can donate to the recipient, or empty array if invalid
 */
export function getCompatibleDonorTypes(recipientBloodType: string): string[] {
  // Check if the blood type is valid
  if (!BLOOD_TYPES.includes(recipientBloodType as BloodType)) {
    return [];
  }

  return COMPATIBILITY_MAP[recipientBloodType as BloodType];
}

/**
 * Check if a donor can give blood to a recipient.
 *
 * @param donorType - The blood type of the donor
 * @param recipientType - The blood type of the recipient
 * @returns true if the donor can donate to the recipient, false otherwise
 */
export function canDonate(donorType: string, recipientType: string): boolean {
  const compatibleDonors = getCompatibleDonorTypes(recipientType);
  return compatibleDonors.includes(donorType);
}
