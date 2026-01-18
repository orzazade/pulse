import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { geospatial } from "./geospatial";

/**
 * Azerbaijan blood donation centers seed data
 */
const AZERBAIJAN_CENTERS = [
  {
    name: "Central Blood Bank of Azerbaijan",
    address: "14 Yusif Safarov Street",
    city: "Baku",
    phone: "+994 12 493 0712",
    latitude: 40.4093,
    longitude: 49.8671,
    hours: "Mon-Fri 9:00-17:00, Sat 9:00-14:00",
  },
  {
    name: "Republican Blood Transfusion Station",
    address: "3 Bakikhanov Street",
    city: "Baku",
    latitude: 40.3897,
    longitude: 49.8274,
    hours: "Mon-Fri 8:00-18:00",
  },
  {
    name: "Ganja Regional Blood Bank",
    address: "24 Javad Khan Street",
    city: "Ganja",
    latitude: 40.6828,
    longitude: 46.3606,
    hours: "Mon-Fri 9:00-17:00",
  },
  {
    name: "Sumqayit Blood Center",
    address: "12 Nizami Street",
    city: "Sumqayit",
    latitude: 40.5897,
    longitude: 49.6686,
    hours: "Mon-Fri 9:00-16:00",
  },
  {
    name: "Lankaran Regional Blood Station",
    address: "Hospital Complex",
    city: "Lankaran",
    latitude: 38.754,
    longitude: 48.851,
    hours: "Mon-Fri 9:00-15:00",
  },
];

/**
 * List all donation centers, optionally filtered by city
 */
export const listCenters = query({
  args: {
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.city) {
      return ctx.db
        .query("donationCenters")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .collect();
    }
    return ctx.db.query("donationCenters").collect();
  },
});

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
    // Query the geospatial index for nearby centers
    const nearbyResults = await geospatial.nearest(ctx, {
      point: { latitude: args.latitude, longitude: args.longitude },
      limit: 20, // Return up to 20 nearest centers
      maxDistance: args.maxDistance,
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

/**
 * Seed donation centers data
 * Checks if centers already exist to avoid duplicates
 * Indexes centers in geospatial after seeding
 */
export const seedCenters = mutation({
  handler: async (ctx) => {
    // Check if centers already exist
    const existingCenters = await ctx.db.query("donationCenters").first();
    if (existingCenters) {
      return { message: "Centers already seeded", count: 0 };
    }

    // Insert all centers
    const now = Date.now();
    for (const center of AZERBAIJAN_CENTERS) {
      await ctx.db.insert("donationCenters", {
        ...center,
        createdAt: now,
      });
    }

    // Schedule indexing of all centers in geospatial
    await ctx.scheduler.runAfter(0, internal.geospatial.indexAllCenters);

    return { message: "Centers seeded successfully", count: AZERBAIJAN_CENTERS.length };
  },
});
