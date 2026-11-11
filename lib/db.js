import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
  max: 5,
});

export default pool;