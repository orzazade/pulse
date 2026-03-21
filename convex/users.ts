import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { BLOOD_TYPES } from "./lib/bloodType";

// Strip internal fields before returning user data to the client
// clerkId is an internal auth identifier; pushToken could be used to send unsolicited notifications
function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, "clerkId" | "pushToken"> {
  const { clerkId: _, pushToken: __, ...safe } = user;
  return safe as Omit<T, "clerkId" | "pushToken">;
}

export const getOrCreateUser = mutation({
  args: {
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    bloodType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) return existing._id;

    // Sanitize and validate input
    const email = args.email?.trim() || undefined;
    const fullName = args.fullName?.trim() || undefined;

    if (email && email.length > 254) {
      throw new Error("Email must be 254 characters or less");
    }
    if (fullName && fullName.length > 100) {
      throw new Error("Full name must be 100 characters or less");
    }

    // Validate blood type if provided
    if (args.bloodType && !BLOOD_TYPES.includes(args.bloodType as typeof BLOOD_TYPES[number])) {
      throw new Error(`Invalid blood type. Must be one of: ${BLOOD_TYPES.join(", ")}`);
    }

    // Build user object with optional fields
    const userData: {
      clerkId: string;
      email?: string;
      fullName?: string;
      bloodType?: string;
      mode?: "donor" | "seeker" | "both";
      createdAt: number;
    } = {
      clerkId,
      createdAt: Date.now(),
    };

    if (email) userData.email = email;
    if (fullName) userData.fullName = fullName;
    if (args.bloodType) {
      userData.bloodType = args.bloodType;
      // Set mode to "donor" when blood type is provided during registration
      userData.mode = "donor";
    }

    const userId = await ctx.db.insert("users", userData);

    // If blood type provided, trigger geospatial index update
    if (args.bloodType) {
      await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
        userId,
      });
    }

    return userId;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;
    return sanitizeUser(user);
  },
});

export const updatePhone = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate phone: must be 5-20 chars, only digits, spaces, dashes, parens, plus
    const phone = args.phone.trim();
    if (phone.length < 5 || phone.length > 20) {
      throw new Error("Phone number must be between 5 and 20 characters");
    }
    if (!/^[+\d\s()-]+$/.test(phone)) {
      throw new Error("Phone number contains invalid characters");
    }

    await ctx.db.patch(user._id, {
      phone,
      phoneVerified: false, // Will be verified later if needed
    });
  },
});

export const updateBloodType = mutation({
  args: { bloodType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate blood type
    if (!BLOOD_TYPES.includes(args.bloodType as typeof BLOOD_TYPES[number])) {
      throw new Error(`Invalid blood type. Must be one of: ${BLOOD_TYPES.join(", ")}`);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Set mode to "donor" if not already set (completing blood type = donor registration)
    const updates: { bloodType: string; mode?: "donor" | "seeker" | "both" } = {
      bloodType: args.bloodType,
    };
    if (!user.mode) {
      updates.mode = "donor";
    }

    await ctx.db.patch(user._id, updates);

    // Trigger geospatial index update (blood type affects filtering)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return sanitizeUser({ ...user, ...updates });
  },
});

export const updateMode = mutation({
  args: {
    mode: v.union(v.literal("donor"), v.literal("seeker"), v.literal("both")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Block switching away from donor mode if user has an active accepted request.
    // Without this, the request would be orphaned — the donor can no longer see or
    // withdraw from it since their UI filters by mode.
    if (args.mode === "seeker" && (user.mode === "donor" || user.mode === "both")) {
      const activeAccepted = await ctx.db
        .query("requests")
        .withIndex("by_donor", (q) => q.eq("acceptedDonorId", user._id))
        .filter((q) => q.eq(q.field("status"), "accepted"))
        .first();

      if (activeAccepted) {
        throw new Error(
          "You have an active accepted request. Complete or withdraw from it before switching to seeker mode."
        );
      }
    }

    await ctx.db.patch(user._id, {
      mode: args.mode,
    });

    // Trigger geospatial index update (mode determines if user should be indexed)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return sanitizeUser({ ...user, mode: args.mode });
  },
});

export const updateLocation = mutation({
  args: {
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate coordinates are finite numbers (NaN/Infinity bypass range checks)
    if (!Number.isFinite(args.latitude) || !Number.isFinite(args.longitude)) {
      throw new Error("Coordinates must be valid numbers");
    }
    if (args.latitude < -90 || args.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (args.longitude < -180 || args.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }

    // Validate and sanitize string inputs
    const city = args.city?.trim() || undefined;
    const region = args.region?.trim() || undefined;
    if (city && city.length > 100) {
      throw new Error("City name must be 100 characters or less");
    }
    if (region && region.length > 100) {
      throw new Error("Region name must be 100 characters or less");
    }

    await ctx.db.patch(user._id, {
      city,
      region,
      latitude: args.latitude,
      longitude: args.longitude,
      locationGranted: true,
    });

    // Trigger geospatial index update (location changed)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return sanitizeUser({
      ...user,
      city,
      region,
      latitude: args.latitude,
      longitude: args.longitude,
      locationGranted: true,
    });
  },
});

export const skipLocation = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      locationGranted: false,
    });

    return sanitizeUser({ ...user, locationGranted: false });
  },
});

export const updateProfile = mutation({
  args: {
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    preferredDonationCenter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate and sanitize string inputs
    const city = args.city !== undefined ? (args.city.trim() || undefined) : undefined;
    const region = args.region !== undefined ? (args.region.trim() || undefined) : undefined;
    const preferredDonationCenter = args.preferredDonationCenter !== undefined
      ? (args.preferredDonationCenter.trim() || undefined)
      : undefined;

    if (city && city.length > 100) {
      throw new Error("City name must be 100 characters or less");
    }
    if (region && region.length > 100) {
      throw new Error("Region name must be 100 characters or less");
    }
    if (preferredDonationCenter && preferredDonationCenter.length > 200) {
      throw new Error("Donation center name must be 200 characters or less");
    }

    // Build update object with only provided fields
    const updates: {
      city?: string;
      region?: string;
      preferredDonationCenter?: string;
    } = {};

    if (args.city !== undefined) updates.city = city;
    if (args.region !== undefined) updates.region = region;
    if (args.preferredDonationCenter !== undefined)
      updates.preferredDonationCenter = preferredDonationCenter;

    await ctx.db.patch(user._id, updates);

    return sanitizeUser({ ...user, ...updates });
  },
});

export const getAvailability = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { isAvailable: true };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { isAvailable: true };

    // Default to true if undefined
    return { isAvailable: user.isAvailable !== false };
  },
});

export const toggleAvailability = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Toggle: if undefined or true, set to false; if false, set to true
    const newAvailability = user.isAvailable === false;

    await ctx.db.patch(user._id, {
      isAvailable: newAvailability,
    });

    // Trigger geospatial index update (availability changed)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return sanitizeUser({ ...user, isAvailable: newAvailability });
  },
});

/**
 * Get user statistics for the current user
 * Returns the count of people helped (accepted requests where user is donor)
 */
export const getUserStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { helpedCount: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { helpedCount: 0 };

    // Count accepted/completed requests where user is the donor
    // Capped at 500 to prevent unbounded data transfer for prolific donors
    const acceptedRequests = await ctx.db
      .query("requests")
      .withIndex("by_donor", (q) => q.eq("acceptedDonorId", user._id))
      .take(500);

    const helpedCount = acceptedRequests.filter(
      (r) => r.status === "accepted" || r.status === "completed"
    ).length;

    return { helpedCount };
  },
});

/**
 * Update push notification token for the current user
 * Called on app start to register device for push notifications
 */
export const updatePushToken = mutation({
  args: { pushToken: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate push token format (Expo push tokens)
    const token = args.pushToken.trim();
    if (token.length === 0 || token.length > 200) {
      throw new Error("Invalid push token");
    }
    if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
      throw new Error("Invalid push token format");
    }

    await ctx.db.patch(user._id, {
      pushToken: token,
    });

    return { success: true };
  },
});

/**
 * Get notification preferences for the current user
 * Returns defaults (true) for any undefined preferences
 */
export const getNotificationPreferences = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return defaults for unauthenticated users
      return {
        notifyRequestMatch: true,
        notifyRequestAccepted: true,
        notifyEligibility: true,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Return defaults if user not found
      return {
        notifyRequestMatch: true,
        notifyRequestAccepted: true,
        notifyEligibility: true,
      };
    }

    // Return preferences, defaulting to true for any undefined values
    return {
      notifyRequestMatch: user.notifyRequestMatch !== false,
      notifyRequestAccepted: user.notifyRequestAccepted !== false,
      notifyEligibility: user.notifyEligibility !== false,
    };
  },
});

/**
 * Update notification preferences for the current user
 * Only updates provided fields (partial update)
 */
export const updateNotificationPreferences = mutation({
  args: {
    notifyRequestMatch: v.optional(v.boolean()),
    notifyRequestAccepted: v.optional(v.boolean()),
    notifyEligibility: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Build update object with only provided fields
    const updates: {
      notifyRequestMatch?: boolean;
      notifyRequestAccepted?: boolean;
      notifyEligibility?: boolean;
    } = {};

    if (args.notifyRequestMatch !== undefined)
      updates.notifyRequestMatch = args.notifyRequestMatch;
    if (args.notifyRequestAccepted !== undefined)
      updates.notifyRequestAccepted = args.notifyRequestAccepted;
    if (args.notifyEligibility !== undefined)
      updates.notifyEligibility = args.notifyEligibility;

    await ctx.db.patch(user._id, updates);

    // Return updated preferences with defaults
    return {
      notifyRequestMatch:
        updates.notifyRequestMatch ?? user.notifyRequestMatch !== false,
      notifyRequestAccepted:
        updates.notifyRequestAccepted ?? user.notifyRequestAccepted !== false,
      notifyEligibility:
        updates.notifyEligibility ?? user.notifyEligibility !== false,
    };
  },
});
