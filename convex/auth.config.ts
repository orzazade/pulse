export default {
  providers: [
    {
      // Domain from Clerk JWT template setup
      // Replace with your Clerk issuer URL from Clerk Dashboard → JWT Templates → Convex
      domain: process.env.CLERK_ISSUER_URL || "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
