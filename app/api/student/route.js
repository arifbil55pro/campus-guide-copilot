/* ===== API DATA MAHASISWA BERDASARKAN SESI LOGIN ===== */

import pool from "@/lib/db";
import { getSessionStudentId } from "@/lib/auth";

export async function GET() {
  try {
    const studentId = await getSessionStudentId();

    if (!studentId) {
      return Response.json(
        { message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        students.nim,
        students.nama,
        students.prodi,
        students.semester,
        COALESCE(krs.status, 'Belum ada data KRS') AS status_krs,
        COALESCE(lecturers.nama, 'Belum ditentukan') AS dosen_wali
      FROM students
      LEFT JOIN krs
        ON students.id = krs.student_id
      LEFT JOIN lecturers
        ON students.dosen_wali_id = lecturers.id
      WHERE students.id = $1
      LIMIT 1;
      `,
      [studentId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { message: "Data mahasiswa tidak ditemukan." },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Student API Error:", error);

    return Response.json(
      {
        message: "Gagal mengambil data mahasiswa.",
      },
      {
        status: 500,
      }
    );
  }
}