import pool from "@/lib/db";
import { getSessionStudentId } from "@/lib/auth";

export async function GET() {
  try {
    const studentId = await getSessionStudentId();

    if (!studentId) {
      return Response.json(
        { success: false, message: "Belum login." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT id, nim, nama, prodi, semester
      FROM students
      WHERE id = $1
      LIMIT 1;
      `,
      [studentId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: "Data mahasiswa tidak ditemukan." },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      student: result.rows[0],
    });
  } catch (error) {
    console.error("Get Session Error:", error);

    return Response.json(
      { success: false, message: "Sesi tidak dapat diperiksa." },
      { status: 500 }
    );
  }
}
