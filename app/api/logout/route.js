import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return Response.json({ success: true, message: "Logout berhasil." });
  } catch (error) {
    console.error("Logout Error:", error);

    return Response.json(
      { success: false, message: "Logout gagal diproses." },
      { status: 500 }
    );
  }
}
