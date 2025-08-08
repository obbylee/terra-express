import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../drizzle/schema";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL as string,
  },
  schema: schema,
  // logger: true,
});
