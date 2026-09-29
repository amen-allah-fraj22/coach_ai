// Tells Convex to trust JWTs minted by this Clerk instance. The issuer
// domain comes from the Clerk dashboard (JWT template named "convex"); set
// it with `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://...clerk.accounts.dev`.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
