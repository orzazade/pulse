import { GeospatialIndex } from "@convex-dev/geospatial";
import { components, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Unified geospatial index for users and donation centers
 * Key: document ID (user or center)
 * FilterKeys:
 * - type: "user" | "center" for filtering by entity type
 * - bloodType: for donor compatibility filtering (users only, centers use "")
 * - isAvailable: for donor availability filtering (users only, centers use true)
 * - city: for city-based filtering (centers only, users use "")
 */
export const geospatial = new GeospatialIndex<
  string,
  { type: "user" | "center"; bloodType: string; isAvailable: boolean; city: string }
>(components.geospatial);

/**
 * Index a user in the geospatial index
 * Called when a user's location, availability, blood type, or mode changes
 */
export const indexUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      // User doesn't exist, nothing to index
      return;
    }

    // Check if user should be in the geospatial index:
    // - Must have location (latitude and longitude)
    // - Must be a donor or both (not seeker-only)
    const hasLocation =
      user.latitude !== undefined && user.longitude !== undefined;
    const isDonor = user.mode === "donor" || user.mode === "both";

    if (hasLocation && isDonor) {
      // Remove any existing entry first (update scenario)
      try {
        await geospatial.remove(ctx, args.userId);
      } catch {
        // Entry might not exist, that's fine
      }

      // Insert new entry with current coordinates and filter keys
      await geospatial.insert(
        ctx,
        args.userId,
        {
          latitude: user.latitude!,
          longitude: user.longitude!,
        },
        {
          type: "user",
          bloodType: user.bloodType ?? "unknown",
          isAvailable: user.isAvailable !== false, // Default to true
          city: "", // Not used for user filtering
        }
      );
    } else {
      // User doesn't qualify for geospatial index, remove if exists
      try {
        await geospatial.remove(ctx, args.userId);
      } catch {
        // Entry might not exist, that's fine
      }
    }
  },
});

/**
 * Remove a user from the geospatial index
 * Called when a user is deleted or should no longer be indexed
 */
export const removeUserFromIndex = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      await geospatial.remove(ctx, args.userId);
    } catch {
      // Entry might not exist, that's fine
    }
  },
});

/**
 * Sync all users to the geospatial index (one-time migration)
 * Indexes all users who have location and are donors/both
 */
export const syncAllUsers = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let indexedCount = 0;

    for (const user of users) {
      const hasLocation =
        user.latitude !== undefined && user.longitude !== undefined;
      const isDonor = user.mode === "donor" || user.mode === "both";

      if (hasLocation && isDonor) {
        // Remove any existing entry first
        try {
          await geospatial.remove(ctx, user._id);
        } catch {
          // Entry might not exist, that's fine
        }

        // Insert into geospatial index
        await geospatial.insert(
          ctx,
          user._id,
          {
            latitude: user.latitude!,
            longitude: user.longitude!,
          },
          {
            type: "user",
            bloodType: user.bloodType ?? "unknown",
            isAvailable: user.isAvailable !== false,
            city: "", // Not used for user filtering
          }
        );
        indexedCount++;
      }
    }

    return { indexedCount, totalUsers: users.length };
  },
});

/**
 * Index a donation center in the geospatial index
 */
export const indexCenter = internalMutation({
  args: { centerId: v.id("donationCenters") },
  handler: async (ctx, args) => {
    const center = await ctx.db.get(args.centerId);
    if (!center) {
      return;
    }

    // Remove any existing entry first (update scenario)
    try {
      await geospatial.remove(ctx, args.centerId);
    } catch {
      // Entry might not exist, that's fine
    }

    // Insert center into geospatial index
    await geospatial.insert(
      ctx,
      args.centerId,
      {
        latitude: center.latitude,
        longitude: center.longitude,
      },
      {
        type: "center",
        bloodType: "", // Not applicable for centers
        isAvailable: true, // Centers are always available
        city: center.city,
      }
    );
  },
});

/**
 * Index all donation centers (call after seeding)
 */
export const indexAllCenters = internalMutation({
  handler: async (ctx) => {
    const centers = await ctx.db.query("donationCenters").collect();
    let indexedCount = 0;

    for (const center of centers) {
      // Remove any existing entry first
      try {
        await geospatial.remove(ctx, center._id);
      } catch {
        // Entry might not exist, that's fine
      }

      // Insert into geospatial index
      await geospatial.insert(
        ctx,
        center._id,
        {
          latitude: center.latitude,
          longitude: center.longitude,
        },
        {
          type: "center",
          bloodType: "",
          isAvailable: true,
          city: center.city,
        }
      );
      indexedCount++;
    }

    return { indexedCount, totalCenters: centers.length };
  },
});
