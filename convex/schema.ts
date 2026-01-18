import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerified: v.optional(v.boolean()),
    bloodType: v.optional(v.string()),
    mode: v.optional(
      v.union(v.literal("donor"), v.literal("seeker"), v.literal("both"))
    ),
    // Location fields
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationGranted: v.optional(v.boolean()),
    // Donor profile fields
    preferredDonationCenter: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()), // Defaults to true for donors
    // Push notification token
    pushToken: v.optional(v.string()),
    // Notification preferences (all default to true when undefined)
    notifyRequestMatch: v.optional(v.boolean()), // Notify on matching blood requests
    notifyRequestAccepted: v.optional(v.boolean()), // Notify when donor accepts
    notifyEligibility: v.optional(v.boolean()), // Notify when eligible to donate
    // Timestamp of last eligibility reminder sent (prevents duplicate reminders)
    lastEligibilityReminder: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_availability", ["isAvailable", "bloodType"]),

  donations: defineTable({
    userId: v.id("users"),
    donationDate: v.number(),
    donationCenter: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "donationDate"]),

  cities: defineTable({
    name: v.string(),
    // Coordinates for future Phase 8 - distance-based search
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
  }).index("by_name", ["name"]),

  requests: defineTable({
    seekerId: v.id("users"),
    bloodType: v.string(),
    units: v.optional(v.number()), // Number of units needed (1-10, defaults to 1)
    urgency: v.union(v.literal("normal"), v.literal("urgent"), v.literal("critical"), v.literal("standard")),
    hospital: v.optional(v.string()), // Hospital or location name
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("accepted"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    acceptedDonorId: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_seeker", ["seekerId"])
    .index("by_status", ["status", "bloodType"])
    .index("by_donor", ["acceptedDonorId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("request_match"),
      v.literal("request_accepted"),
      v.literal("eligibility_reminder")
    ),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    data: v.optional(
      v.object({
        requestId: v.optional(v.id("requests")),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  donationCenters: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    phone: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    hours: v.optional(v.string()), // e.g., "Mon-Fri 9:00-17:00"
    createdAt: v.number(),
  }).index("by_city", ["city"]),
});
