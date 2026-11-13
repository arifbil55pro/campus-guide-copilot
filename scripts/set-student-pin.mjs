import nextEnv from "@next/env";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Pool } from "pg";
import { hashPin } from "../lib/pin.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_POOLED atau DATABASE_URL belum dikonfigurasi.");
}

const readline = createInterface({ input, output });
const pool = new Pool({ connectionString, max: 1 });

async function main() {
  try {
    const nim = (await readline.question("NIM mahasiswa: ")).trim();
    const pin = (await readline.question("PIN baru (6 angka): ")).trim();
    const confirmation = (await readline.question("Ulangi PIN: ")).trim();

    if (!/^\d{6}$/.test(pin) || pin !== confirmation) {
      throw new Error("PIN harus 6 angka dan kedua input harus sama.");
    }

    const student = await pool.query(
      "SELECT id, nim, nama FROM students WHERE nim = $1 LIMIT 1",
      [nim]
    );

    if (student.rows.length === 0) {
      throw new Error("NIM tidak ditemukan di database.");
    }

    const pinHash = await hashPin(pin);

    await pool.query(
      `
      INSERT INTO student_credentials (student_id, pin_hash)
      VALUES ($1, $2)
      ON CONFLICT (student_id)
      DO UPDATE SET pin_hash = EXCLUDED.pin_hash, updated_at = NOW()
      `,
      [student.rows[0].id, pinHash]
    );

    console.log(`PIN untuk ${student.rows[0].nama} (${student.rows[0].nim}) berhasil disimpan.`);
  } finally {
    readline.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
