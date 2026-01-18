import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 56-day donation cycle (8 weeks between donations)
const DONATION_CYCLE_DAYS = 56;

/**
 * Add a new donation record
 */
export const addDonation = mutation({
  args: {
    donationDate: v.number(),
    donationCenter: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate donationDate is not in the future
    const now = Date.now();
    if (args.donationDate > now) {
      throw new Error("Donation date cannot be in the future");
    }

    // Insert donation
    const donationId = await ctx.db.insert("donations", {
      userId: user._id,
      donationDate: args.donationDate,
      donationCenter: args.donationCenter,
      notes: args.notes,
      createdAt: now,
    });

    return donationId;
  },
});

/**
 * Delete a donation record
 */
export const deleteDonation = mutation({
  args: {
    donationId: v.id("donations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get donation and verify ownership
    const donation = await ctx.db.get(args.donationId);
    if (!donation) throw new Error("Donation not found");

    if (donation.userId !== user._id) {
      throw new Error("Not authorized to delete this donation");
    }

    await ctx.db.delete(args.donationId);
  },
});

/**
 * Get user's donation history sorted by date descending
 */
export const getDonationHistory = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { donations: [], totalCount: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { donations: [], totalCount: 0 };

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return {
      donations,
      totalCount: donations.length,
    };
  },
});

/**
 * Get the most recent donation
 */
export const getLastDonation = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const lastDonation = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    return lastDonation;
  },
});

/**
 * Get donation statistics
 */
export const getDonationStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalDonations: 0,
        lastDonationDate: null,
        daysSinceLastDonation: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        totalDonations: 0,
        lastDonationDate: null,
        daysSinceLastDonation: null,
      };
    }

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalDonations = donations.length;

    if (totalDonations === 0) {
      return {
        totalDonations: 0,
        lastDonationDate: null,
        daysSinceLastDonation: null,
      };
    }

    // Find most recent donation
    const lastDonation = donations.reduce((latest, current) =>
      current.donationDate > latest.donationDate ? current : latest
    );

    const now = Date.now();
    const daysSinceLastDonation = Math.floor(
      (now - lastDonation.donationDate) / (1000 * 60 * 60 * 24)
    );

    return {
      totalDonations,
      lastDonationDate: lastDonation.donationDate,
      daysSinceLastDonation,
    };
  },
});

/**
 * Get eligibility status for donation based on 56-day cycle
 */
export const getEligibilityStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isEligible: true,
        daysUntilEligible: 0,
        lastDonationDate: null,
        nextEligibleDate: null,
        daysSinceLastDonation: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        isEligible: true,
        daysUntilEligible: 0,
        lastDonationDate: null,
        nextEligibleDate: null,
        daysSinceLastDonation: null,
      };
    }

    // Get most recent donation
    const lastDonation = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    // No donations = eligible (first-time donor)
    if (!lastDonation) {
      return {
        isEligible: true,
        daysUntilEligible: 0,
        lastDonationDate: null,
        nextEligibleDate: null,
        daysSinceLastDonation: null,
      };
    }

    const now = Date.now();
    const daysSinceLastDonation = Math.floor(
      (now - lastDonation.donationDate) / (1000 * 60 * 60 * 24)
    );

    const isEligible = daysSinceLastDonation >= DONATION_CYCLE_DAYS;
    const daysUntilEligible = isEligible
      ? 0
      : DONATION_CYCLE_DAYS - daysSinceLastDonation;

    // Calculate next eligible date
    const nextEligibleDate = isEligible
      ? null
      : lastDonation.donationDate + DONATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;

    return {
      isEligible,
      daysUntilEligible,
      lastDonationDate: lastDonation.donationDate,
      nextEligibleDate,
      daysSinceLastDonation,
    };
  },
});
