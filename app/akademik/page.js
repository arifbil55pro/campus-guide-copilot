"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AkademikPage() {
  /* ===== STATE DATA MAHASISWA ===== */
  const [mahasiswa, setMahasiswa] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  /* ===== DETEKSI TEMA (ANTI-KEDIP / FOUC) ===== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("navipus-theme");
    if (savedTheme === "light") {
      setIsDark(false);
    } else if (savedTheme === "dark") {
      setIsDark(true);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
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

  /* ===== AMBIL DATA DARI API ===== */ 
  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await fetch("/api/student");
        const data = await response.json();

        setMahasiswa(data);
      } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
      }
    };

    fetchMahasiswa();
  }, []);

  if (!isThemeReady) {
    return <main className="min-h-screen bg-transparent" />;
  }

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden px-4 py-12 transition-colors duration-300 sm:px-6 ${
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
        className={`fixed top-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition duration-200 hover:scale-105 active:scale-95 ${
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
        className={`pointer-events-none fixed -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-[130px] transition-opacity duration-300 ${
          isDark ? "bg-blue-600/25" : "bg-blue-500/20"
        }`}
      />
      <div
        className={`pointer-events-none fixed -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full blur-[130px] transition-opacity duration-300 ${
          isDark ? "bg-red-600/20" : "bg-red-500/15"
        }`}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* ===== HEADER AKADEMIK ===== */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                isDark
                  ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  : "border-slate-300/80 bg-white/70 text-slate-700 hover:bg-white"
              }`}
            >
              ← Kembali ke Beranda
            </Link>
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                isDark
                  ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                  : "border-blue-600/25 bg-blue-600/10 text-blue-700"
              }`}
            >
              NAVIPUS • AKADEMIK
            </span>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Akademik
          </h1>

          <p
            className={`mt-3 text-base ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Informasi akademik, status KRS, dosen wali, dan bantuan untuk
            kebutuhan perkuliahan.
          </p>
        </header>

        {/* ===== INFORMASI MAHASISWA ===== */}
        <section
          className={`mb-6 rounded-3xl border p-6 backdrop-blur-xl transition-all ${
            isDark
              ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
              : "border-white/90 bg-white/65 shadow-[0_8px_32px_0_rgba(30,58,138,0.1)]"
          }`}
        >
          <div
            className={`mb-4 h-1 w-16 rounded-full bg-gradient-to-r ${
              isDark
                ? "from-red-500 via-white to-blue-500 opacity-80"
                : "from-red-600 via-slate-300 to-blue-600 opacity-90"
            }`}
          />

          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            👤 Informasi Mahasiswa
          </h2>

          {mahasiswa ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/75"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Nama Lengkap
                </p>
                <p
                  className={`mt-1 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {mahasiswa.nama}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/75"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  NIM
                </p>
                <p
                  className={`mt-1 font-bold ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  {mahasiswa.nim}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/75"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Program Studi
                </p>
                <p
                  className={`mt-1 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {mahasiswa.prodi}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/75"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Semester
                </p>
                <p
                  className={`mt-1 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Semester {mahasiswa.semester}
                </p>
              </div>
            </div>
          ) : (
            <p
              className={`mt-4 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Memuat data mahasiswa...
            </p>
          )}
        </section>

        {/* ===== DOSEN WALI ===== */}
        <section
          className={`mb-6 rounded-3xl border p-6 backdrop-blur-xl transition-all ${
            isDark
              ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
              : "border-white/90 bg-white/65 shadow-[0_8px_32px_0_rgba(30,58,138,0.1)]"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            👨‍🏫 Dosen Wali
          </h2>

          <div
            className={`mt-4 rounded-2xl border p-4 font-semibold ${
              isDark
                ? "border-white/10 bg-black/30 text-slate-200"
                : "border-slate-200/80 bg-white/75 text-slate-800"
            }`}
          >
            {mahasiswa ? mahasiswa.dosen_wali : "Memuat data..."}
          </div>
        </section>

        {/* ===== PROSEDUR AKADEMIK ===== */}
        <section
          className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
            isDark
              ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
              : "border-white/90 bg-white/65 shadow-[0_8px_32px_0_rgba(30,58,138,0.1)]"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            📖 Prosedur Akademik
          </h2>

          <p
            className={`mt-3 text-sm leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            NAVIPUS (Campus Guide Copilot) dapat membantu menjelaskan KRS,
            jadwal kuliah, dosen wali, pembuatan draft surat akademik, dan
            prosedur akademik lainnya langsung melalui asisten AI di halaman
            beranda.
          </p>
        </section>
      </div>
    </main>
  );
}