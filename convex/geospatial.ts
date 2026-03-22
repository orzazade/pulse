import { GeospatialIndex } from "@convex-dev/geospatial";
import { components } from "./_generated/api";
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
