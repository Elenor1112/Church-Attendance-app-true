import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// For local development or build times where DATABASE_URL might not be present,
// we don't throw an error immediately but let it throw when a query is executed.
// This is important because Railway builds static sites/assets in a environment where
// DATABASE_URL is not always bound during the compilation build phase.
export const pool = new pg.Pool({
  connectionString: databaseUrl || "postgresql://localhost:5432/postgres",
});

export const db = drizzle(pool, { schema });
