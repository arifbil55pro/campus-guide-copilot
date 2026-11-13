"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, pin }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login Request Error:", error);
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-red-50/30 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-blue-100">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold text-blue-700">NAVIPUS</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Login Mahasiswa
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masukkan NIM dan nama sesuai data kampus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            NIM
            <input
              value={nim}
              onChange={(event) => setNim(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Contoh: 2501402028"
              inputMode="numeric"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            PIN 6 digit
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Masukkan 6 angka"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              required
            />
          </label>

          {message && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
