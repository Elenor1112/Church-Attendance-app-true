import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";
import path from "path";

async function run() {
  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("Migrations completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  }
}

run()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    pool.end();
    process.exit(1);
  });
