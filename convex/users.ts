import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getCompatibleDonorTypes } from "./lib/bloodType";
import { geospatial } from "./geospatial";

const VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    bloodType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing._id;

    // Validate blood type if provided
    if (args.bloodType && !VALID_BLOOD_TYPES.includes(args.bloodType as typeof VALID_BLOOD_TYPES[number])) {
      throw new Error(`Invalid blood type. Must be one of: ${VALID_BLOOD_TYPES.join(", ")}`);
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
      clerkId: args.clerkId,
      createdAt: Date.now(),
    };

    if (args.email) userData.email = args.email;
    if (args.fullName) userData.fullName = args.fullName;
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

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
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

    await ctx.db.patch(user._id, {
      phone: args.phone,
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
    if (!VALID_BLOOD_TYPES.includes(args.bloodType as typeof VALID_BLOOD_TYPES[number])) {
      throw new Error(`Invalid blood type. Must be one of: ${VALID_BLOOD_TYPES.join(", ")}`);
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

    return { ...user, ...updates };
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

    await ctx.db.patch(user._id, {
      mode: args.mode,
    });

    // Trigger geospatial index update (mode determines if user should be indexed)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return { ...user, mode: args.mode };
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

    await ctx.db.patch(user._id, {
      city: args.city,
      region: args.region,
      latitude: args.latitude,
      longitude: args.longitude,
      locationGranted: true,
    });

    // Trigger geospatial index update (location changed)
    await ctx.scheduler.runAfter(0, internal.geospatial.indexUser, {
      userId: user._id,
    });

    return {
      ...user,
      city: args.city,
      region: args.region,
      latitude: args.latitude,
      longitude: args.longitude,
      locationGranted: true,
    };
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

    return { ...user, locationGranted: false };
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

    // Build update object with only provided fields
    const updates: {
      city?: string;
      region?: string;
      preferredDonationCenter?: string;
    } = {};

    if (args.city !== undefined) updates.city = args.city;
    if (args.region !== undefined) updates.region = args.region;
    if (args.preferredDonationCenter !== undefined)
      updates.preferredDonationCenter = args.preferredDonationCenter;

    await ctx.db.patch(user._id, updates);

    return { ...user, ...updates };
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

    return { ...user, isAvailable: newAvailability };
  },
});

export const searchDonors = query({
  args: {
    bloodType: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user to exclude from results
    const identity = await ctx.auth.getUserIdentity();
    const currentUserClerkId = identity?.subject;

    // Get compatible donor blood types if blood type filter provided
    const compatibleTypes = args.bloodType
      ? getCompatibleDonorTypes(args.bloodType)
      : null;

    // If invalid blood type provided, return empty results
    if (args.bloodType && compatibleTypes?.length === 0) {
      return [];
    }

    // Query all users and filter
    const allUsers = await ctx.db.query("users").collect();

    const donors = allUsers
      .filter((user) => {
        // Exclude current user
        if (currentUserClerkId && user.clerkId === currentUserClerkId) {
          return false;
        }

        // Filter by mode: must be "donor" or "both" (not "seeker")
        if (user.mode === "seeker") {
          return false;
        }

        // Filter by availability: true or undefined (defaults to available)
        if (user.isAvailable === false) {
          return false;
        }

        // Filter by blood type compatibility if specified
        if (compatibleTypes && user.bloodType) {
          if (!compatibleTypes.includes(user.bloodType)) {
            return false;
          }
        }

        // Filter by city if specified
        if (args.city && user.city !== args.city) {
          return false;
        }

        // Filter by region if specified
        if (args.region && user.region !== args.region) {
          return false;
        }

        return true;
      })
      .slice(0, 50); // Limit to 50 results

    // Return only necessary fields
    return donors.map((user) => ({
      _id: user._id,
      bloodType: user.bloodType,
      city: user.city,
      region: user.region,
      isAvailable: user.isAvailable !== false, // Normalize to boolean
    }));
  },
});

/**
 * Search for donors near a geographic location using geospatial index
 * Returns donors within maxDistance meters of the given coordinates
 */
export const searchNearbyDonors = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    bloodType: v.optional(v.string()),
    maxDistance: v.optional(v.number()), // meters, default 50000 (50km)
  },
  handler: async (ctx, args) => {
    // Get current user to exclude from results
    const identity = await ctx.auth.getUserIdentity();
    const currentUserClerkId = identity?.subject;

    // Get compatible donor blood types if blood type filter provided
    const compatibleTypes = args.bloodType
      ? getCompatibleDonorTypes(args.bloodType)
      : null;

    // If invalid blood type provided, return empty results
    if (args.bloodType && compatibleTypes?.length === 0) {
      return [];
    }

    // Query geospatial index for nearby users
    const nearbyResults = await geospatial.nearest(ctx, {
      point: { latitude: args.latitude, longitude: args.longitude },
      limit: 50,
      maxDistance: args.maxDistance ?? 50000, // Default 50km
      filter: (q) => q.eq("type", "user").eq("isAvailable", true),
    });

    // Get user IDs from results
    const userIds = nearbyResults.map((result) => result.key as Id<"users">);

    // Fetch full user documents
    const usersWithDistance = await Promise.all(
      userIds.map(async (userId, index) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;
        // Attach distance from geospatial result
        const nearbyResult = nearbyResults[index];
        return {
          _id: user._id as Id<"users">,
          clerkId: (user as { clerkId?: string }).clerkId,
          bloodType: (user as { bloodType?: string }).bloodType,
          city: (user as { city?: string }).city,
          region: (user as { region?: string }).region,
          isAvailable: (user as { isAvailable?: boolean }).isAvailable,
          distance: nearbyResult?.distance ?? 0,
        };
      })
    );

    // Filter results
    const donors = usersWithDistance.filter(
      (user): user is NonNullable<typeof user> => {
        if (!user) return false;

        // Exclude current user
        if (currentUserClerkId && user.clerkId === currentUserClerkId) {
          return false;
        }

        // Filter by blood type compatibility if specified
        if (compatibleTypes && user.bloodType) {
          if (!compatibleTypes.includes(user.bloodType)) {
            return false;
          }
        }

        return true;
      }
    );

    // Return only necessary fields with distance
    return donors.map((user) => ({
      _id: user._id,
      bloodType: user.bloodType,
      city: user.city,
      region: user.region,
      isAvailable: user.isAvailable !== false,
      distance: user.distance,
    }));
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
    const acceptedRequests = await ctx.db
      .query("requests")
      .withIndex("by_donor", (q) => q.eq("acceptedDonorId", user._id))
      .collect();

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

    await ctx.db.patch(user._id, {
      pushToken: args.pushToken,
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
