import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { geospatial } from "./geospatial";

/**
 * Search for donation centers near a given location
 * Uses geospatial index for efficient nearest-neighbor queries
 */
export const searchNearbyCenters = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    maxDistance: v.optional(v.number()), // Maximum distance in meters
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (!Number.isFinite(args.latitude) || !Number.isFinite(args.longitude) ||
        args.latitude < -90 || args.latitude > 90 || args.longitude < -180 || args.longitude > 180) {
      return [];
    }

    // Validate maxDistance: must be positive and finite, cap at 200km
    const maxDistance = args.maxDistance ?? 50000;
    if (!Number.isFinite(maxDistance) || maxDistance <= 0) {
      return [];
    }
    const clampedDistance = Math.min(maxDistance, 200000); // Cap at 200km

    // Query the geospatial index for nearby centers
    const nearbyResults = await geospatial.nearest(ctx, {
      point: { latitude: args.latitude, longitude: args.longitude },
      limit: 20, // Return up to 20 nearest centers
      maxDistance: clampedDistance,
      filter: (q) => q.eq("type", "center"),
    });

    // Fetch full center details for each result
    const centersWithDistance = await Promise.all(
      nearbyResults.map(async (result) => {
        const center = await ctx.db.get(result.key as Id<"donationCenters">);
        if (!center) return null;
        return {
          ...center,
          distance: result.distance,
        };
      })
    );

    // Filter out null results and return
    return centersWithDistance.filter(
      (c): c is NonNullable<typeof c> => c !== null
    );
  },
});
