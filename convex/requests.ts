import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getCompatibleDonorTypes } from "./lib/bloodType";

// 56-day donation cycle (8 weeks between donations)
const DONATION_CYCLE_DAYS = 56;

/**
 * Request System
 *
 * Blood request workflow: seekers create requests, donors accept them.
 * Privacy: Phone numbers only shared after acceptance.
 */

// ============ MUTATIONS ============

/**
 * Create a new blood request
 * Only users in seeker or both mode can create requests
 */
export const createRequest = mutation({
  args: {
    bloodType: v.string(),
    units: v.optional(v.number()),
    urgency: v.union(v.literal("normal"), v.literal("urgent"), v.literal("critical"), v.literal("standard")),
    hospital: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate user mode - must be seeker or both (not donor-only or unset)
    if (user.mode !== "seeker" && user.mode !== "both") {
      throw new Error("Only seekers can create blood requests");
    }

    // Rate limit: max 5 open requests per user
    const openRequests = await ctx.db
      .query("requests")
      .withIndex("by_seeker", (q) => q.eq("seekerId", user._id))
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();

    if (openRequests.length >= 5) {
      throw new Error("You can have at most 5 open requests. Please cancel or wait for existing ones to be fulfilled.");
    }

    // Validate blood type
    const VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!VALID_BLOOD_TYPES.includes(args.bloodType)) {
      throw new Error(`Invalid blood type. Must be one of: ${VALID_BLOOD_TYPES.join(", ")}`);
    }

    // Validate units (1-10, must be whole number, defaults to 1)
    const units = args.units ?? 1;
    if (!Number.isFinite(units) || !Number.isInteger(units) || units < 1 || units > 10) {
      throw new Error("Units must be a whole number between 1 and 10");
    }

    // Sanitize and validate string inputs
    const hospital = args.hospital?.trim() || undefined;
    const city = args.city?.trim() || undefined;
    const notes = args.notes?.trim() || undefined;

    if (notes && notes.length > 500) {
      throw new Error("Notes must be 500 characters or less");
    }
    if (hospital && hospital.length > 200) {
      throw new Error("Hospital name must be 200 characters or less");
    }
    if (city && city.length > 100) {
      throw new Error("City name must be 100 characters or less");
    }

    const requestId = await ctx.db.insert("requests", {
      seekerId: user._id,
      bloodType: args.bloodType,
      units,
      urgency: args.urgency,
      hospital,
      city,
      notes,
      status: "open",
      createdAt: Date.now(),
    });

    // Notify matching donors asynchronously
    await ctx.scheduler.runAfter(0, internal.requests.notifyMatchingDonors, {
      requestId,
      bloodType: args.bloodType,
      urgency: args.urgency,
      city,
      seekerId: user._id,
    });

    return requestId;
  },
});

/**
 * Broadcast emergency blood request
 * Rate limited: only 1 urgent request per hour per user
 * Only seeker or both mode can broadcast
 */
export const broadcastEmergency = mutation({
  args: {
    bloodType: v.string(),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Validate user mode - must be seeker or both (not donor-only or unset)
    if (user.mode !== "seeker" && user.mode !== "both") {
      throw new Error("Only seekers can broadcast emergency requests");
    }

    // Validate blood type
    const VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!VALID_BLOOD_TYPES.includes(args.bloodType)) {
      throw new Error(`Invalid blood type. Must be one of: ${VALID_BLOOD_TYPES.join(", ")}`);
    }

    // Sanitize and validate string inputs
    const city = args.city?.trim() || undefined;
    const notes = args.notes?.trim() || undefined;

    if (notes && notes.length > 500) {
      throw new Error("Notes must be 500 characters or less");
    }
    if (city && city.length > 100) {
      throw new Error("City name must be 100 characters or less");
    }

    // Rate limiting: Check for critical/urgent requests in the last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentUrgentRequests = await ctx.db
      .query("requests")
      .withIndex("by_seeker", (q) => q.eq("seekerId", user._id))
      .filter((q) =>
        q.and(
          q.gt(q.field("createdAt"), oneHourAgo),
          q.or(
            q.eq(q.field("urgency"), "urgent"),
            q.eq(q.field("urgency"), "critical")
          )
        )
      )
      .collect();

    if (recentUrgentRequests.length > 0) {
      throw new Error("Please wait before sending another emergency broadcast");
    }

    // Rate limit: max 5 open requests per user (consistent with createRequest)
    const openRequests = await ctx.db
      .query("requests")
      .withIndex("by_seeker", (q) => q.eq("seekerId", user._id))
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();

    if (openRequests.length >= 5) {
      throw new Error("You can have at most 5 open requests. Please cancel or wait for existing ones to be fulfilled.");
    }

    const requestId = await ctx.db.insert("requests", {
      seekerId: user._id,
      bloodType: args.bloodType,
      units: 1, // Default to 1 unit for emergency
      urgency: "critical",
      city,
      notes,
      status: "open",
      createdAt: Date.now(),
    });

    // Notify matching donors asynchronously (critical requests)
    await ctx.scheduler.runAfter(0, internal.requests.notifyMatchingDonors, {
      requestId,
      bloodType: args.bloodType,
      urgency: "critical",
      city,
      seekerId: user._id,
    });

    return requestId;
  },
});

/**
 * Cancel a request
 * - Seekers can cancel their own open or accepted requests
 * - Donors can withdraw from accepted requests (reverts to open)
 */
export const cancelRequest = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const isSeeker = request.seekerId === user._id;
    const isDonor = request.acceptedDonorId === user._id;

    // Donor withdrawing from an accepted request
    if (isDonor && request.status === "accepted") {
      await ctx.db.patch(args.requestId, {
        status: "open",
        acceptedDonorId: undefined,
        acceptedAt: undefined,
      });

      // Notify the seeker that the donor withdrew
      const seeker = await ctx.db.get(request.seekerId);
      if (seeker) {
        await ctx.db.insert("notifications", {
          userId: request.seekerId,
          type: "request_match",
          title: "Donor Withdrew",
          body: `The donor for your ${request.bloodType} blood request has withdrawn. Your request is open again for other donors.`,
          read: false,
          data: { requestId: args.requestId },
          createdAt: Date.now(),
        });

        if (seeker.pushToken && seeker.notifyRequestAccepted !== false) {
          await ctx.scheduler.runAfter(
            0,
            internal.notifications.sendPushNotification,
            {
              pushToken: seeker.pushToken,
              title: "Donor Withdrew",
              body: `The donor for your ${request.bloodType} blood request has withdrawn. Your request is open again for other donors.`,
              data: { type: "donor_withdrew", requestId: args.requestId },
            }
          );
        }
      }

      return { success: true };
    }

    // Seeker cancelling their own request
    if (!isSeeker) {
      throw new Error("You can only cancel your own requests");
    }

    if (request.status !== "open" && request.status !== "accepted") {
      throw new Error("Can only cancel open or accepted requests");
    }

    // Clear donor association when cancelling an accepted request (privacy: don't
    // retain the link between donor and a cancelled record). Notification below
    // uses the pre-patch `request` snapshot so the donorId is still available.
    const cancelPatch: { status: "cancelled"; acceptedDonorId?: undefined; acceptedAt?: undefined } = {
      status: "cancelled",
    };
    if (request.status === "accepted" && request.acceptedDonorId) {
      cancelPatch.acceptedDonorId = undefined;
      cancelPatch.acceptedAt = undefined;
    }
    await ctx.db.patch(args.requestId, cancelPatch);

    // Notify the accepted donor that the request was cancelled
    if (request.status === "accepted" && request.acceptedDonorId) {
      const donor = await ctx.db.get(request.acceptedDonorId);
      if (donor) {
        await ctx.db.insert("notifications", {
          userId: request.acceptedDonorId,
          type: "request_match",
          title: "Request Cancelled",
          body: `The ${request.bloodType} blood request you accepted has been cancelled by the seeker.`,
          read: false,
          data: { requestId: args.requestId },
          createdAt: Date.now(),
        });

        if (donor.pushToken && donor.notifyRequestAccepted !== false) {
          await ctx.scheduler.runAfter(
            0,
            internal.notifications.sendPushNotification,
            {
              pushToken: donor.pushToken,
              title: "Request Cancelled",
              body: `The ${request.bloodType} blood request you accepted has been cancelled by the seeker.`,
              data: { type: "request_cancelled", requestId: args.requestId },
            }
          );
        }
      }
    }

    return { success: true };
  },
});

/**
 * Accept a request
 * Only donors with compatible blood type and availability can accept
 */
export const acceptRequest = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Verify donor mode - must be donor or both (not seeker-only or unset)
    if (user.mode !== "donor" && user.mode !== "both") {
      throw new Error("Only donors can accept blood requests");
    }

    // Verify availability
    if (user.isAvailable === false) {
      throw new Error("You must be available to accept requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Only accept open requests
    if (request.status !== "open") {
      throw new Error("This request is no longer open");
    }

    // Verify donor blood type is set
    if (!user.bloodType) {
      throw new Error("Please set your blood type before accepting requests");
    }

    // Verify blood type compatibility
    const compatibleDonors = getCompatibleDonorTypes(request.bloodType);
    if (!compatibleDonors.includes(user.bloodType)) {
      throw new Error("Your blood type is not compatible with this request");
    }

    // Cannot accept own request
    if (request.seekerId === user._id) {
      throw new Error("You cannot accept your own request");
    }

    // Verify donor is eligible (56-day donation cycle)
    // Check 1: donations table (primary source)
    const lastDonation = await ctx.db
      .query("donations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (lastDonation) {
      const daysSince = Math.floor(
        (Date.now() - lastDonation.donationDate) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < DONATION_CYCLE_DAYS) {
        const daysLeft = DONATION_CYCLE_DAYS - daysSince;
        throw new Error(
          `You are not yet eligible to donate. ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining until your next eligible donation.`
        );
      }
    }

    // Check 2: recently completed requests (tamper-proof — donors can't delete these)
    // Prevents bypass via deleting auto-recorded donation records
    const recentlyCompletedAsDonor = await ctx.db
      .query("requests")
      .withIndex("by_donor", (q) => q.eq("acceptedDonorId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const cycleMsMin = DONATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const tooRecentCompletion = recentlyCompletedAsDonor.find(
      (r) => r.acceptedAt && now - r.acceptedAt < cycleMsMin
    );

    if (tooRecentCompletion) {
      const daysSince = Math.floor(
        (now - tooRecentCompletion.acceptedAt!) / (1000 * 60 * 60 * 24)
      );
      const daysLeft = DONATION_CYCLE_DAYS - daysSince;
      throw new Error(
        `You are not yet eligible to donate. ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining until your next eligible donation.`
      );
    }

    // Prevent donor from accepting multiple requests simultaneously
    const activeAccepted = await ctx.db
      .query("requests")
      .withIndex("by_donor", (q) => q.eq("acceptedDonorId", user._id))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (activeAccepted) {
      throw new Error(
        "You already have an active accepted request. Complete or withdraw from it before accepting another."
      );
    }

    await ctx.db.patch(args.requestId, {
      status: "accepted",
      acceptedDonorId: user._id,
      acceptedAt: Date.now(),
    });

    // Notify the seeker that their request was accepted
    await ctx.scheduler.runAfter(0, internal.requests.notifySeekerAccepted, {
      requestId: args.requestId,
      seekerId: request.seekerId,
    });

    return { success: true };
  },
});

/**
 * Decline a request (placeholder for future)
 * Currently, donors simply don't accept - this could track declined donors
 * to not show the request to them again in the future
 */
export const declineRequest = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Verify donor mode
    if (user.mode !== "donor" && user.mode !== "both") {
      throw new Error("Only donors can decline requests");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Can only decline open requests
    if (request.status !== "open") {
      throw new Error("Can only decline open requests");
    }

    // Cannot decline own request
    if (request.seekerId === user._id) {
      throw new Error("You cannot decline your own request");
    }

    // Placeholder - validated but not tracking yet
    // Future: track declined donors in a separate table
    return { success: true, message: "Request declined (not tracking yet)" };
  },
});

/**
 * Mark a request as completed
 * Only the seeker who created it can mark as complete
 */
export const completeRequest = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Verify ownership
    if (request.seekerId !== user._id) {
      throw new Error("Only the seeker can mark a request as complete");
    }

    // Can only complete accepted requests
    if (request.status !== "accepted") {
      throw new Error("Can only complete accepted requests");
    }

    await ctx.db.patch(args.requestId, {
      status: "completed",
    });

    // Auto-record donation for the accepted donor so the 56-day eligibility
    // cycle is enforced even if the donor doesn't manually log it.
    if (request.acceptedDonorId) {
      const now = Date.now();
      const cycleMsMin = DONATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;

      // Only record if no donation exists within the last 56 days
      // (donor may have already logged it manually via addDonation)
      const recentDonation = await ctx.db
        .query("donations")
        .withIndex("by_user", (q) => q.eq("userId", request.acceptedDonorId!))
        .order("desc")
        .first();

      const alreadyRecorded =
        recentDonation && now - recentDonation.donationDate < cycleMsMin;

      if (!alreadyRecorded) {
        await ctx.db.insert("donations", {
          userId: request.acceptedDonorId,
          donationDate: now,
          donationCenter: request.hospital,
          notes: `Auto-recorded from completed request (${request.bloodType})`,
          createdAt: now,
        });
      }
    }

    // Notify the donor that the request was completed (thank you)
    if (request.acceptedDonorId) {
      const donor = await ctx.db.get(request.acceptedDonorId);
      if (donor) {
        await ctx.db.insert("notifications", {
          userId: request.acceptedDonorId,
          type: "request_accepted",
          title: "Thank You for Donating!",
          body: `The ${request.bloodType} blood request has been marked as completed. Your donation made a difference.`,
          read: false,
          data: { requestId: args.requestId },
          createdAt: Date.now(),
        });

        if (donor.pushToken && donor.notifyRequestAccepted !== false) {
          await ctx.scheduler.runAfter(
            0,
            internal.notifications.sendPushNotification,
            {
              pushToken: donor.pushToken,
              title: "Thank You for Donating!",
              body: `The ${request.bloodType} blood request has been marked as completed. Your donation made a difference.`,
              data: { type: "request_completed", requestId: args.requestId },
            }
          );
        }
      }
    }

    return { success: true };
  },
});

// ============ QUERIES ============

/**
 * Get current user's created requests (seeker view)
 * Includes accepted donor info (but NOT phone - see getRequestDetail for that)
 */
export const getMyRequests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const requests = await ctx.db
      .query("requests")
      .withIndex("by_seeker", (q) => q.eq("seekerId", user._id))
      .collect();

    // Sort by createdAt descending (most recent first), cap at 100 results
    // to prevent unbounded data transfer for users with extensive history
    const sortedRequests = requests
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100);

    // Fetch accepted donor info for accepted requests
    const requestsWithDonor = await Promise.all(
      sortedRequests.map(async (request) => {
        if (request.acceptedDonorId) {
          const donor = await ctx.db.get(request.acceptedDonorId);
          return {
            ...request,
            acceptedDonor: donor
              ? {
                  _id: donor._id,
                  bloodType: donor.bloodType,
                  city: donor.city,
                  // Note: phone NOT included here - use getRequestDetail for that
                }
              : null,
          };
        }
        return { ...request, acceptedDonor: null };
      })
    );

    return requestsWithDonor;
  },
});

/**
 * Get incoming requests for donors
 * Returns open requests matching donor's compatible blood types
 * Filtered by donor's city if set, excludes own requests
 * Sorted by urgency (urgent first), then by createdAt
 */
export const getIncomingRequests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Only donors or both mode users can see incoming requests
    if (user.mode === "seeker") {
      return [];
    }

    // Need blood type to determine compatibility
    if (!user.bloodType) {
      return [];
    }

    // Get open requests, capped at 500 to prevent unbounded data transfer
    // (result is sliced to 50 after filtering; 500 provides ample margin)
    const openRequests = await ctx.db
      .query("requests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(500);

    // Filter by compatibility, city, and exclude self
    const filteredRequests = openRequests.filter((request) => {
      // Exclude own requests
      if (request.seekerId === user._id) {
        return false;
      }

      // Check blood type compatibility - can this donor donate to this recipient?
      const compatibleDonors = getCompatibleDonorTypes(request.bloodType);
      if (!compatibleDonors.includes(user.bloodType!)) {
        return false;
      }

      // Filter by donor's city if set
      if (user.city && request.city && request.city !== user.city) {
        return false;
      }

      return true;
    });

    // Sort: critical > urgent > normal > standard, then by createdAt (newest first within same urgency)
    const urgencyPriority: Record<string, number> = { critical: 0, urgent: 1, normal: 2, standard: 3 };
    const sortedRequests = filteredRequests.sort((a, b) => {
      const aPriority = urgencyPriority[a.urgency] ?? 2;
      const bPriority = urgencyPriority[b.urgency] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.createdAt - a.createdAt;
    });

    // Limit results to prevent excessive data transfer as request volume grows.
    // Sorted by urgency first, so the most critical requests are always included.
    const limitedRequests = sortedRequests.slice(0, 50);

    // Fetch seeker info for each request
    const requestsWithSeeker = await Promise.all(
      limitedRequests.map(async (request) => {
        const seeker = await ctx.db.get(request.seekerId);
        return {
          ...request,
          seeker: seeker
            ? {
                _id: seeker._id,
                city: seeker.city,
                // Note: phone NOT included - privacy until accepted
              }
            : null,
        };
      })
    );

    return requestsWithSeeker;
  },
});

/**
 * Get home feed requests
 * Returns open requests matching user's blood type compatibility
 * - For donors: requests they can help with (their blood type can donate to)
 * - For seekers: requests they might need (any open requests they could receive from)
 * Sorted by urgency (urgent first), then by createdAt (newest first)
 * Limited to 10 most recent matching requests
 */
export const getHomeFeedRequests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Only donors or both mode users see the donor-oriented home feed
    if (user.mode === "seeker") {
      return [];
    }

    // Must have blood type set to see compatible requests
    if (!user.bloodType) {
      return [];
    }

    // Get open requests, capped at 200 most recent to prevent unbounded data transfer
    // (home feed only shows 10 results; 200 provides ample margin for blood type filtering)
    const openRequests = await ctx.db
      .query("requests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(200);

    // Filter based on user mode and blood type compatibility
    const filteredRequests = openRequests.filter((request) => {
      // Exclude own requests
      if (request.seekerId === user._id) {
        return false;
      }

      // For donors/both: show requests they can help with
      // Check if user's blood type can donate to the request's blood type
      const compatibleDonors = getCompatibleDonorTypes(request.bloodType);
      return compatibleDonors.includes(user.bloodType!);
    });

    // Sort: critical > urgent > normal > standard, then by createdAt (newest first)
    const urgencyPriority: Record<string, number> = { critical: 0, urgent: 1, normal: 2, standard: 3 };
    const sortedRequests = filteredRequests.sort((a, b) => {
      const aPriority = urgencyPriority[a.urgency] ?? 2;
      const bPriority = urgencyPriority[b.urgency] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.createdAt - a.createdAt;
    });

    // Limit to 10 most recent
    const limitedRequests = sortedRequests.slice(0, 10);

    // Fetch seeker info (city only, NOT phone for privacy)
    const requestsWithSeeker = await Promise.all(
      limitedRequests.map(async (request) => {
        const seeker = await ctx.db.get(request.seekerId);
        return {
          ...request,
          seeker: seeker
            ? {
                _id: seeker._id,
                city: seeker.city,
                // Note: phone NOT included - privacy until accepted
              }
            : null,
        };
      })
    );

    return requestsWithSeeker;
  },
});

/**
 * List all open requests for the search/discovery screen
 * Returns open requests with seeker info (city only, no phone)
 * Can be filtered by blood type and urgency
 */
export const listOpenRequests = query({
  args: {
    bloodType: v.optional(v.string()),
    urgency: v.optional(v.union(v.literal("normal"), v.literal("urgent"), v.literal("critical"), v.literal("standard"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get open requests, capped at 500 to prevent unbounded data transfer
    // (result is sliced to 100 after sorting; 500 provides ample margin for filtering)
    let requests = await ctx.db
      .query("requests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(500);

    // Filter by blood type if specified
    if (args.bloodType) {
      requests = requests.filter((r) => r.bloodType === args.bloodType);
    }

    // Filter by urgency if specified
    if (args.urgency) {
      requests = requests.filter((r) => r.urgency === args.urgency);
    }

    // Sort: critical > urgent > normal > standard, then by createdAt (newest first)
    const urgencyPriority: Record<string, number> = { critical: 0, urgent: 1, normal: 2, standard: 3 };
    const sortedRequests = requests.sort((a, b) => {
      const aPriority = urgencyPriority[a.urgency] ?? 2;
      const bPriority = urgencyPriority[b.urgency] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.createdAt - a.createdAt;
    });

    // Limit results to prevent excessive data transfer as request volume grows.
    // Sorted by urgency first, so the most critical requests are always included.
    const limitedRequests = sortedRequests.slice(0, 100);

    // Fetch seeker info for each request
    const requestsWithSeeker = await Promise.all(
      limitedRequests.map(async (request) => {
        const seeker = await ctx.db.get(request.seekerId);
        return {
          ...request,
          seeker: seeker
            ? {
                _id: seeker._id,
                city: seeker.city,
              }
            : null,
        };
      })
    );

    return requestsWithSeeker;
  },
});

/**
 * Get detailed request information
 * Privacy: Phone numbers only shared after acceptance
 * - If accepted AND current user is acceptedDonor: include seeker phone
 * - If accepted AND current user is seeker: include donor phone
 */
export const getRequestDetail = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    // Fetch seeker info
    const seeker = await ctx.db.get(request.seekerId);
    const isSeeker = request.seekerId === user._id;
    const isDonor = request.acceptedDonorId === user._id;

    // Build seeker info with conditional phone and name
    // Privacy: fullName only visible to the seeker themselves or the accepted donor
    const isAcceptedOrCompleted = request.status === "accepted" || request.status === "completed";
    let seekerInfo = null;
    if (seeker) {
      seekerInfo = {
        _id: seeker._id,
        fullName: isSeeker || (isAcceptedOrCompleted && isDonor) ? seeker.fullName : undefined,
        bloodType: seeker.bloodType,
        city: seeker.city,
        // Phone visible to donor after acceptance (including after completion for follow-up)
        phone: isAcceptedOrCompleted && isDonor ? seeker.phone : undefined,
      };
    }

    // Fetch donor info if accepted
    // Privacy: fullName only visible to the donor themselves or the seeker
    let donorInfo = null;
    if (request.acceptedDonorId) {
      const donor = await ctx.db.get(request.acceptedDonorId);
      if (donor) {
        donorInfo = {
          _id: donor._id,
          fullName: isDonor || (isAcceptedOrCompleted && isSeeker) ? donor.fullName : undefined,
          bloodType: donor.bloodType,
          city: donor.city,
          // Phone visible to seeker after acceptance (including after completion for follow-up)
          phone: isAcceptedOrCompleted && isSeeker ? donor.phone : undefined,
        };
      }
    }

    return {
      ...request,
      seeker: seekerInfo,
      donor: donorInfo,
      isSeeker,
      isDonor,
    };
  },
});

// ============ INTERNAL MUTATIONS ============

/**
 * Notify matching donors about a new blood request
 * Called asynchronously after request creation
 *
 * Finds donors who:
 * 1. Have mode "donor" or "both"
 * 2. Have compatible blood type (can donate to request's blood type)
 * 3. Are available (isAvailable !== false)
 * 4. Have notifyRequestMatch preference not explicitly false
 * 5. Have a push token registered
 * 6. Optionally match request city
 *
 * Limited to 100 donors to avoid overload
 */
export const notifyMatchingDonors = internalMutation({
  args: {
    requestId: v.id("requests"),
    bloodType: v.string(),
    urgency: v.union(v.literal("normal"), v.literal("urgent"), v.literal("critical"), v.literal("standard")),
    city: v.optional(v.string()),
    seekerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get compatible donor blood types for this request
    const compatibleDonorTypes = getCompatibleDonorTypes(args.bloodType);
    if (compatibleDonorTypes.length === 0) return { notificationsSent: 0 };

    // Get potential donors, capped at 2000 to prevent loading entire users table
    // (result is sliced to 100 after filtering; 2000 provides ample margin)
    const allUsers = await ctx.db.query("users").take(2000);

    // Filter to matching donors
    const matchingDonors = allUsers.filter((user) => {
      // Must be a donor
      if (user.mode !== "donor" && user.mode !== "both") return false;

      // Must have compatible blood type
      if (!user.bloodType || !compatibleDonorTypes.includes(user.bloodType))
        return false;

      // Must be available (default true when undefined)
      if (user.isAvailable === false) return false;

      // Must have notifyRequestMatch preference not explicitly false
      if (user.notifyRequestMatch === false) return false;

      // Must have push token
      if (!user.pushToken) return false;

      // Must not be the seeker who created the request
      if (user._id === args.seekerId) return false;

      // Optionally filter by city (notify all if no city specified in request)
      // For now, we notify all matching donors regardless of city

      return true;
    });

    // Limit to 100 donors to prevent overload
    const limitedDonors = matchingDonors.slice(0, 100);

    const title =
      args.urgency === "critical" ? "CRITICAL Blood Request!" :
      args.urgency === "urgent" ? "Urgent Blood Request!" : "New Blood Request";
    const body = `${args.bloodType} blood needed${args.city ? ` in ${args.city}` : ""}`;

    let notificationsSent = 0;

    for (const donor of limitedDonors) {
      // Create in-app notification
      await ctx.db.insert("notifications", {
        userId: donor._id,
        type: "request_match",
        title,
        body,
        read: false,
        data: { requestId: args.requestId },
        createdAt: now,
      });

      // Schedule push notification
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.sendPushNotification,
        {
          pushToken: donor.pushToken!,
          title,
          body,
          data: {
            type: "request_match",
            requestId: args.requestId,
          },
        }
      );

      notificationsSent++;
    }

    return { notificationsSent };
  },
});

/**
 * Notify seeker that their request was accepted by a donor
 * Called asynchronously after request acceptance
 */
export const notifySeekerAccepted = internalMutation({
  args: {
    requestId: v.id("requests"),
    seekerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get the seeker
    const seeker = await ctx.db.get(args.seekerId);
    if (!seeker) return { notificationSent: false };

    // Check if seeker wants to be notified (default true)
    if (seeker.notifyRequestAccepted === false) {
      return { notificationSent: false };
    }

    const title = "Donor Found!";
    const body =
      "A donor has accepted your blood request. Check the request for contact details.";

    // Create in-app notification
    await ctx.db.insert("notifications", {
      userId: args.seekerId,
      type: "request_accepted",
      title,
      body,
      read: false,
      data: { requestId: args.requestId },
      createdAt: now,
    });

    // Send push notification if seeker has push token
    if (seeker.pushToken) {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.sendPushNotification,
        {
          pushToken: seeker.pushToken,
          title,
          body,
          data: {
            type: "request_accepted",
            requestId: args.requestId,
          },
        }
      );
    }

    return { notificationSent: true };
  },
});
