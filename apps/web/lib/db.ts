/**
 * Re-exported so app code imports from the conventional `@/lib/db` path
 * rather than reaching into the database package directly everywhere.
 * The actual singleton lives in packages/database — see that file for why.
 */
export { prisma } from "@qt/database";
