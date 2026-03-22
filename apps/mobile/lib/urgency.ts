/**
 * Shared urgency utilities for request display.
 */

export function mapUrgency(urgency: string): "critical" | "urgent" | "standard" {
  if (urgency === "critical") return "critical";
  if (urgency === "urgent") return "urgent";
  return "standard";
}

export function formatNeededBy(urgency: string): string {
  const now = new Date();

  if (urgency === "critical") {
    // Same day
    const hours = now.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `Today, ${displayHour}:00 ${period}`;
  }

  if (urgency === "urgent") {
    // 1-2 days
    return `Tomorrow`;
  }

  // Standard - within a week
  return `Within 7 days`;
}
