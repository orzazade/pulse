export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum UserMode {
  DONOR = 'donor',
  SEEKER = 'seeker',
  BOTH = 'both',
}

export enum RequestStatus {
  OPEN = 'open',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum Urgency {
  STANDARD = 'standard',
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum NotificationType {
  REQUEST_MATCH = 'request_match',
  REQUEST_ACCEPTED = 'request_accepted',
  REQUEST_COMPLETED = 'request_completed',
  REQUEST_CANCELLED = 'request_cancelled',
  DONOR_WITHDREW = 'donor_withdrew',
  ELIGIBILITY_REMINDER = 'eligibility_reminder',
  THANK_YOU = 'thank_you',
  GENERAL = 'general',
}
