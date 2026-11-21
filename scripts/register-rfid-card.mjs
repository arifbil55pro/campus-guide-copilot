import nextEnv from "@next/env";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Pool } from "pg";

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
    const cardUid = (
      await readline.question("UID kartu RFID (huruf/angka): ")
    )
      .trim()
      .replace(/[\s:-]/g, "")
      .toUpperCase();

    if (!cardUid || !/^[A-F0-9]+$/.test(cardUid)) {
      throw new Error("UID kartu hanya boleh berisi karakter hexadecimal.");
    }

    const student = await pool.query(
      "SELECT id, nim, nama FROM students WHERE nim = $1 LIMIT 1",
      [nim]
    );

    if (student.rows.length === 0) {
      throw new Error("NIM tidak ditemukan.");
    }

    await pool.query(
      `
      INSERT INTO rfid_cards (student_id, card_uid)
      VALUES ($1, $2)
      ON CONFLICT (student_id)
      DO UPDATE
      SET card_uid = EXCLUDED.card_uid,
          is_active = TRUE,
          updated_at = NOW()
      `,
      [student.rows[0].id, cardUid]
    );

    console.log(
      `Kartu ${cardUid} berhasil dihubungkan ke ${student.rows[0].nama} (${student.rows[0].nim}).`
    );
  } finally {
    readline.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
