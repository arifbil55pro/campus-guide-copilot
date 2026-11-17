"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LayananPage() {
  /* ===== STATE DATA LAYANAN ===== */
  const [services, setServices] = useState([]);

  /* ===== STATE LAYANAN TERPILIH ===== */
  const [selectedService, setSelectedService] = useState(null);

  /* ===== STATE TEMA DUAL-MODE ===== */
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
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();

        setServices(data);
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error);
      }
    };

    fetchServices();
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

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ===== HEADER ===== */}
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
                  ? "border-red-400/30 bg-red-500/10 text-red-300"
                  : "border-red-600/25 bg-red-600/10 text-red-700"
              }`}
            >
              NAVIPUS • LAYANAN
            </span>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            🏢 Layanan Mahasiswa
          </h1>

          <p
            className={`mt-3 text-base ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Temukan informasi administrasi, beasiswa, persuratan, dan layanan
            mahasiswa yang kamu butuhkan di kampus.
          </p>
        </header>

        {/* ===== DETAIL LAYANAN ===== */}
        {selectedService ? (
          <section
            className={`rounded-3xl border p-6 backdrop-blur-xl transition-all sm:p-8 ${
              isDark
                ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.55)]"
                : "border-white/90 bg-white/70 shadow-[0_8px_32px_0_rgba(30,58,138,0.12)]"
            }`}
          >
            {/* Aksen Garis Tipis Gradasi Merah-Putih-Biru */}
            <div
              className={`mb-6 h-1 w-20 rounded-full bg-gradient-to-r ${
                isDark
                  ? "from-red-500 via-white to-blue-500 opacity-80"
                  : "from-red-600 via-slate-300 to-blue-600 opacity-90"
              }`}
            />

            {/* ===== TOMBOL KEMBALI ===== */}
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className={`mb-6 inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isDark
                  ? "border-white/15 bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
                  : "border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ← Kembali ke Daftar Layanan
            </button>

            {/* ===== NAMA LAYANAN ===== */}
            <h2
              className={`text-3xl font-extrabold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {selectedService.nama}
            </h2>

            {/* ===== KATEGORI ===== */}
            <div className="mt-4">
              <span
                className={`inline-block rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide ${
                  isDark
                    ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                    : "border-blue-200 bg-blue-100/90 text-blue-700"
                }`}
              >
                {selectedService.kategori}
              </span>
            </div>

            {/* ===== DESKRIPSI ===== */}
            <div className="mt-6">
              <h3
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Deskripsi
              </h3>

              <p
                className={`mt-2 text-sm leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {selectedService.deskripsi}
              </p>
            </div>

            {/* ===== INFORMASI LAYANAN ===== */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* ===== PERSYARATAN ===== */}
              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/80"
                }`}
              >
                <h3
                  className={`font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  📋 Persyaratan
                </h3>

                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {selectedService.persyaratan}
                </p>
              </div>

              {/* ===== LOKASI ===== */}
              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/80"
                }`}
              >
                <h3
                  className={`font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  📍 Lokasi
                </h3>

                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {selectedService.lokasi}
                </p>
              </div>

              {/* ===== JAM LAYANAN ===== */}
              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/80"
                }`}
              >
                <h3
                  className={`font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  🕐 Jam Layanan
                </h3>

                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {selectedService.jam_layanan}
                </p>
              </div>

              {/* ===== ESTIMASI PROSES ===== */}
              <div
                className={`rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-black/30"
                    : "border-slate-200/80 bg-white/80"
                }`}
              >
                <h3
                  className={`font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  ⏱️ Estimasi Proses
                </h3>

                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {selectedService.estimasi_proses}
                </p>
              </div>
            </div>

            {/* ===== INFO MVP ===== */}
            <div
              className={`mt-6 rounded-2xl border p-4 ${
                isDark
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                  : "border-blue-200 bg-blue-50/90 text-blue-800"
              }`}
            >
              <p className="font-bold">💡 Informasi</p>

              <p className="mt-1 text-sm leading-relaxed">
                Untuk saat ini halaman hanya menampilkan informasi layanan.
                Untuk pembuatan draft surat permohonan mahasiswa, kamu dapat
                langsung menggunakan asisten AI NAVIPUS di halaman beranda.
              </p>
            </div>
          </section>
        ) : (
          /* ===== DAFTAR LAYANAN ===== */
          <section>
            <h2
              className={`mb-5 text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Daftar Layanan
            </h2>

            {/* ===== LOADING ===== */}
            {services.length === 0 ? (
              <div
                className={`rounded-2xl border p-6 text-sm backdrop-blur-xl ${
                  isDark
                    ? "border-white/15 bg-white/[0.06] text-slate-400"
                    : "border-white/90 bg-white/65 text-slate-500"
                }`}
              >
                Memuat data layanan...
              </div>
            ) : (
              /* ===== GRID LAYANAN ===== */
              <div className="grid gap-6 md:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`group flex flex-col justify-between rounded-3xl border p-6 text-left backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                      isDark
                        ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] hover:border-blue-400/50 hover:bg-white/[0.1]"
                        : "border-white/90 bg-white/70 shadow-[0_8px_32px_0_rgba(30,58,138,0.08)] hover:border-blue-300 hover:bg-white/90 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* ===== NAMA LAYANAN ===== */}
                      <h3
                        className={`text-xl font-bold transition-colors ${
                          isDark
                            ? "text-white group-hover:text-blue-300"
                            : "text-slate-900 group-hover:text-blue-700"
                        }`}
                      >
                        {service.nama}
                      </h3>

                      {/* ===== KATEGORI ===== */}
                      <div className="mt-3">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${
                            isDark
                              ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                              : "border-blue-200 bg-blue-100/90 text-blue-700"
                          }`}
                        >
                          {service.kategori}
                        </span>
                      </div>

                      {/* ===== DESKRIPSI ===== */}
                      <p
                        className={`mt-4 text-sm leading-relaxed ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {service.deskripsi}
                      </p>
                    </div>

                    <div>
                      {/* ===== INFORMASI SINGKAT ===== */}
                      <div
                        className={`mt-5 space-y-2 border-t pt-4 text-xs ${
                          isDark
                            ? "border-white/10 text-slate-300"
                            : "border-slate-200/80 text-slate-600"
                        }`}
                      >
                        <p>
                          <strong>📍 Lokasi:</strong> {service.lokasi}
                        </p>

                        <p>
                          <strong>🕐 Jam:</strong> {service.jam_layanan}
                        </p>

                        <p>
                          <strong>⏱️ Estimasi:</strong>{" "}
                          {service.estimasi_proses}
                        </p>
                      </div>

                      {/* ===== TOMBOL DETAIL ===== */}
                      <div className="mt-5">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-1 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          Lihat Detail →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}