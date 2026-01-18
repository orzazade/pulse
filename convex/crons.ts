import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run eligibility reminder check daily at 9:00 AM UTC
crons.daily(
  "eligibility-reminders",
  { hourUTC: 9, minuteUTC: 0 },
  internal.notifications.checkEligibilityReminders
);

export default crons;
