import pool from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const nim = typeof body.nim === "string" ? body.nim.trim() : "";
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";

    if (!nim || !nama) {
      return Response.json(
        {
          success: false,
          message: "NIM dan nama wajib diisi.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT id, nim, nama, prodi, semester
      FROM students
      WHERE nim = $1 AND LOWER(TRIM(nama)) = LOWER(TRIM($2))
      LIMIT 1;
      `,
      [nim, nama]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "NIM dan nama tidak cocok dengan data mahasiswa.",
        },
        { status: 401 }
      );
    }

    const student = result.rows[0];
    await setSession(student.id);

    return Response.json({
      success: true,
      message: "Login berhasil.",
      student,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return Response.json(
      {
        success: false,
        message: "Login gagal diproses.",
      },
      { status: 500 }
    );
  }
}
