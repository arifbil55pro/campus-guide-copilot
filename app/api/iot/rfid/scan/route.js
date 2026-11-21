import pool from "@/lib/db";
import { verifyDeviceSecret } from "@/lib/device-auth.mjs";

export async function POST(request) {
  try {
    const secret = request.headers.get("x-device-secret");

    if (!verifyDeviceSecret(secret)) {
      return Response.json(
        { success: false, message: "Perangkat RFID tidak diizinkan." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const cardUid =
      typeof body.uid === "string"
        ? body.uid.trim().replace(/[\s:-]/g, "").toUpperCase()
        : "";
    const deviceName =
      typeof body.device_name === "string"
        ? body.device_name.trim().slice(0, 64)
        : "ESP32-RFID";

    if (!cardUid || !/^[A-F0-9]+$/.test(cardUid)) {
      return Response.json(
        { success: false, message: "UID kartu tidak valid." },
        { status: 400 }
      );
    }

    const card = await pool.query(
      `
      SELECT
        rfid_cards.id AS rfid_card_id,
        rfid_cards.card_uid,
        students.id AS student_id,
        students.nim,
        students.nama,
        students.prodi,
        students.semester
      FROM rfid_cards
      JOIN students ON students.id = rfid_cards.student_id
      WHERE rfid_cards.card_uid = $1
        AND rfid_cards.is_active = TRUE
      LIMIT 1;
      `,
      [cardUid]
    );

    if (card.rows.length === 0) {
      return Response.json(
        { success: false, message: "Kartu RFID tidak terdaftar atau tidak aktif." },
        { status: 404 }
      );
    }

    const record = card.rows[0];
    const attendance = await pool.query(
      `
      INSERT INTO attendance (
        student_id,
        rfid_card_id,
        attendance_date,
        attendance_time,
        status,
        method,
        device_name
      )
      VALUES (
        $1,
        $2,
        (NOW() AT TIME ZONE 'Asia/Makassar')::date,
        (NOW() AT TIME ZONE 'Asia/Makassar')::time,
        'Hadir',
        'RFID',
        $3
      )
      ON CONFLICT (student_id, attendance_date) DO NOTHING
      RETURNING attendance_date, attendance_time, status;
      `,
      [record.student_id, record.rfid_card_id, deviceName]
    );

    if (attendance.rows.length === 0) {
      return Response.json({
        success: true,
        duplicate: true,
        message: "Mahasiswa sudah tercatat hadir hari ini.",
        student: record,
      });
    }

    return Response.json({
      success: true,
      duplicate: false,
      message: "Absensi RFID berhasil dicatat.",
      student: record,
      attendance: attendance.rows[0],
    });
  } catch (error) {
    console.error("RFID Scan Error:", error);

    return Response.json(
      { success: false, message: "Absensi RFID gagal diproses." },
      { status: 500 }
    );
  }
}
