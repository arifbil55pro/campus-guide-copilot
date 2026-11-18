"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Deteksi tema seketika sebelum layar ditampilkan agar tidak ada kedipan (FOUC)
  useEffect(() => {
    const savedTheme = localStorage.getItem("navipus-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    } else if (savedTheme === "dark") {
      setIsDark(true);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    setIsThemeReady(true);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("navipus-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  }

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

  // Jangan tampilkan warna yang salah sebelum pengecekan tema selesai
  if (!isThemeReady) {
    return <main className="min-h-screen bg-transparent" />;
  }

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 transition-colors duration-300 ${
        isDark
          ? "bg-[#070B14] text-white"
          : "bg-gradient-to-br from-slate-100 via-blue-50 to-red-50/60 text-slate-900"
      }`}
    >
      {/* Tombol Toggle Tema Bulan / Matahari di Pojok Kanan Atas */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
        title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
        className={`fixed top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition duration-200 hover:scale-105 active:scale-95 ${
          isDark
            ? "border-white/15 bg-white/10 text-amber-300 shadow-lg shadow-black/40 hover:bg-white/15"
            : "border-slate-300/80 bg-white/75 text-slate-700 shadow-md hover:bg-white"
        }`}
      >
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        )}
      </button>

      {/* Efek Ambient Glow Biru & Merah Politala di Latar Belakang */}
      <div
        className={`pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full blur-[120px] transition-opacity duration-300 ${
          isDark ? "bg-blue-600/30" : "bg-blue-500/25"
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full blur-[120px] transition-opacity duration-300 ${
          isDark ? "bg-red-600/25" : "bg-red-500/20"
        }`}
      />
      <div
        className={`pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] ${
          isDark ? "bg-indigo-500/10" : "bg-blue-300/20"
        }`}
      />

      {/* Kotak Login Glassmorphism */}
      <section
        className={`relative z-10 w-full max-w-md rounded-3xl border p-8 backdrop-blur-xl transition-all duration-300 ${
          isDark
            ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"
            : "border-white/90 bg-white/65 shadow-[0_8px_32px_0_rgba(30,58,138,0.12)]"
        }`}
      >
        {/* Aksen Garis Tipis Gradasi Merah-Putih-Biru di Bagian Atas Kartu */}
        <div
          className={`mx-auto mb-6 h-1 w-20 rounded-full bg-gradient-to-r ${
            isDark
              ? "from-red-500 via-white to-blue-500 opacity-80"
              : "from-red-600 via-slate-300 to-blue-600 opacity-90"
          }`}
        />

        <div className="mb-8 text-center">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase transition-colors ${
              isDark
                ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                : "border-blue-600/25 bg-blue-600/10 text-blue-700"
            }`}
          >
            NAVIPUS
          </span>
          <h1
            className={`mt-3 text-3xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Login Mahasiswa
          </h1>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Masukkan NIM dan PIN 6 digit sesuai data kampus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label
            className={`block text-sm font-medium ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            Nomor Induk Mahasiswa
            <input
              value={nim}
              onChange={(event) => setNim(event.target.value)}
              className={`mt-1.5 w-full rounded-xl border px-4 py-3 outline-none transition ${
                isDark
                  ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-black/60 focus:ring-2 focus:ring-blue-500/30"
                  : "border-slate-300/80 bg-white/75 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              }`}
              placeholder="Masukkan NIM anda"
              inputMode="numeric"
              required
            />
          </label>

          <div
            className={`block text-sm font-medium ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            <label htmlFor="pin-input">PIN 6 digit</label>
            <div className="relative mt-1.5">
              <input
                id="pin-input"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className={`w-full rounded-xl border py-3 pr-12 pl-4 tracking-widest outline-none transition ${
                  isDark
                    ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-red-400 focus:bg-black/60 focus:ring-2 focus:ring-red-500/30"
                    : "border-slate-300/80 bg-white/75 text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                }`}
                placeholder={showPin ? "123456" : "••••••"}
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                className={`absolute inset-y-0 right-0 flex items-center pr-3.5 transition focus:outline-none ${
                  isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {showPin ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${
                isDark
                  ? "border-red-500/30 bg-red-500/15 text-red-200"
                  : "border-red-300 bg-red-50/90 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-900/30 transition duration-200 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}