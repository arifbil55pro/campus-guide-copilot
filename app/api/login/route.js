import pool from "@/lib/db";
import { setSession } from "@/lib/auth";
import { verifyPin } from "@/lib/pin.mjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const nim = typeof body.nim === "string" ? body.nim.trim() : "";
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    if (!/^\d{6}$/.test(pin)) {
      return Response.json(
        {
          success: false,
          message: "PIN harus terdiri dari 6 angka.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT students.id, students.nim, students.nama, students.prodi,
        students.semester, student_credentials.pin_hash
      FROM students
      LEFT JOIN student_credentials
        ON student_credentials.student_id = students.id
      WHERE students.nim = $1
      LIMIT 1;
      `,
      [nim]
    );

    const student = result.rows[0];

    if (!student || !student.pin_hash) {
      return Response.json(
        {
          success: false,
          message: "PIN mahasiswa belum diatur oleh admin.",
        },
        { status: 403 }
      );
    }

    if (!(await verifyPin(pin, student.pin_hash))) {
      return Response.json(
        {
          success: false,
          message: "NIM atau PIN salah.",
        },
        { status: 401 }
      );
    }

    await setSession(student.id);

    return Response.json({
      success: true,
      message: "Login berhasil.",
      student: {
        id: student.id,
        nim: student.nim,
        nama: student.nama,
        prodi: student.prodi,
        semester: student.semester,
      },
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
