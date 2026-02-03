import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { news } from "./schema";

const connectionString = process.env.DATABASE_URL;

let _db: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({ connectionString });
}

/** Drizzle client (ใช้ schema สำหรับ type inference) */
export function getDb() {
  if (!_db) {
    _db = drizzle({ client: getPool(), schema: { news } });
  }
  return _db;
}

export * from "./schema";
