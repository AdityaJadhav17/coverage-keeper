// Vercel sets this at build time; local builds fall back to the dev server.
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const SITE_TITLE =
  "Coverage Keeper: understand your health coverage letter";

export const SITE_DESCRIPTION =
  "Got a letter about your Medicaid coverage? Take a photo and in about a minute see what it asks for, when it's due, and what to send. Free, no sign-up.";
