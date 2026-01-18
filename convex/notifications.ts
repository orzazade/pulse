import {
  mutation,
  query,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// 56-day donation cycle (8 weeks between donations)
const DONATION_CYCLE_DAYS = 56;
const DONATION_CYCLE_MS = DONATION_CYCLE_DAYS * 24 * 60 * 60 * 1000;

/**
 * Notification System
 *
 * In-app notifications for blood donation events:
 * - request_match: New request matches donor's blood type
 * - request_accepted: A donor accepted seeker's request
 * - eligibility_reminder: Donor is eligible to donate again
 */

// ============ QUERIES ============

/**
 * Get notifications for current user
 * Returns list of notifications ordered by createdAt desc
 * Limited to 50 most recent
 */
export const getNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort by createdAt descending (most recent first)
    const sortedNotifications = notifications
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);

    return sortedNotifications;
  },
});

/**
 * Get unread notification count for badge display
 */
export const getUnreadCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// ============ MUTATIONS ============

/**
 * Mark a single notification as read
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    // Verify ownership
    if (notification.userId !== user._id) {
      throw new Error("You can only mark your own notifications as read");
    }

    await ctx.db.patch(args.notificationId, { read: true });

    return { success: true };
  },
});

/**
 * Mark all notifications as read for current user
 */
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get all unread notifications for this user
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // Mark each as read
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return { success: true, count: unreadNotifications.length };
  },
});

// ============ INTERNAL MUTATIONS ============

/**
 * Create a notification (for use by other functions like cron jobs)
 * This is an internal mutation, not exposed to clients
 */
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("request_match"),
      v.literal("request_accepted"),
      v.literal("eligibility_reminder")
    ),
    title: v.string(),
    body: v.string(),
    data: v.optional(
      v.object({
        requestId: v.optional(v.id("requests")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      read: false,
      data: args.data,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Check and send eligibility reminders to donors who just became eligible
 * Called by cron job daily at 9:00 AM UTC
 *
 * Finds donors who:
 * 1. Have mode "donor" or "both"
 * 2. Have a push token registered
 * 3. Have a donation exactly 56 days ago (just became eligible)
 * 4. Haven't received an eligibility reminder since their last donation
 */
export const checkEligibilityReminders = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Get all users who might need eligibility reminders
    // - mode is donor or both
    // - have a push token
    // - notifyEligibility is not explicitly false (defaults to true)
    const allUsers = await ctx.db.query("users").collect();

    const eligibleUsers = allUsers.filter(
      (user) =>
        (user.mode === "donor" || user.mode === "both") &&
        user.pushToken &&
        user.notifyEligibility !== false // Default true when undefined
    );

    let remindersCount = 0;

    for (const user of eligibleUsers) {
      // Get user's most recent donation
      const lastDonation = await ctx.db
        .query("donations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      // Skip users with no donations (first-time donors already eligible)
      if (!lastDonation) continue;

      // Check if user became eligible recently (within 24 hours of 56 days mark)
      const daysSinceLastDonation = Math.floor(
        (now - lastDonation.donationDate) / (1000 * 60 * 60 * 24)
      );

      // Only notify users who are newly eligible (56 days exactly, or 56-57 day window)
      // This ensures we catch users who just crossed the threshold
      if (daysSinceLastDonation < DONATION_CYCLE_DAYS || daysSinceLastDonation > DONATION_CYCLE_DAYS + 1) {
        continue;
      }

      // Check if we already sent a reminder since this donation
      // lastEligibilityReminder should be after the donation date to have been sent
      if (
        user.lastEligibilityReminder &&
        user.lastEligibilityReminder > lastDonation.donationDate
      ) {
        continue;
      }

      // Create in-app notification
      await ctx.db.insert("notifications", {
        userId: user._id,
        type: "eligibility_reminder",
        title: "You can donate again!",
        body: "It's been 56 days since your last donation. You're eligible to donate blood.",
        read: false,
        createdAt: now,
      });

      // Update user's lastEligibilityReminder timestamp
      await ctx.db.patch(user._id, {
        lastEligibilityReminder: now,
      });

      // Schedule push notification (runs as action)
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.sendPushNotification,
        {
          pushToken: user.pushToken!,
          title: "You can donate again!",
          body: "It's been 56 days since your last donation. You're eligible to donate blood.",
          data: { type: "eligibility_reminder" },
        }
      );

      remindersCount++;
    }

    return { remindersSent: remindersCount };
  },
});

// ============ INTERNAL ACTIONS ============

/**
 * Send a push notification via Expo's push notification service
 * Used by cron jobs and other internal functions
 */
export const sendPushNotification = internalAction({
  args: {
    pushToken: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const message = {
      to: args.pushToken,
      sound: "default",
      title: args.title,
      body: args.body,
      data: args.data ?? {},
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    if (result.data?.status === "error") {
      console.error("Push notification error:", result.data.message);
    }
    return result;
  },
});
