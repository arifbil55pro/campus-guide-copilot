import nextEnv from "@next/env";
import { Pool } from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_POOLED atau DATABASE_URL belum dikonfigurasi.");
}

const pool = new Pool({ connectionString, max: 1 });

try {
  await pool.query("BEGIN");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rfid_cards (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      student_id INTEGER NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
      card_uid VARCHAR(64) NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      rfid_card_id INTEGER NOT NULL REFERENCES rfid_cards(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      attendance_time TIME NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'Hadir',
      method VARCHAR(20) NOT NULL DEFAULT 'RFID',
      device_name VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (student_id, attendance_date)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_attendance_student_date
    ON attendance (student_id, attendance_date DESC);
  `);

  await pool.query("COMMIT");
  console.log("Struktur RFID dan attendance berhasil dibuat.");
} catch (error) {
  await pool.query("ROLLBACK");
  throw error;
} finally {
  await pool.end();
}
