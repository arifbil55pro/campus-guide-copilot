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
      SELECT
        attendance_date,
        attendance_time,
        status,
        method,
        device_name,
        created_at
      FROM attendance
      WHERE student_id = $1
      ORDER BY attendance_date DESC, attendance_time DESC
      LIMIT 50;
      `,
      [studentId]
    );

    return Response.json({
      success: true,
      attendance: result.rows,
    });
  } catch (error) {
    console.error("Attendance History Error:", error);

    return Response.json(
      { success: false, message: "Riwayat absensi gagal dimuat." },
      { status: 500 }
    );
  }
}
