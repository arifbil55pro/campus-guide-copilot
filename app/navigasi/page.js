"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

/* ===== LOAD CAMPUS MAP ===== */
const CampusMap = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function NavigasiPage() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  const detailLocationRef = useRef(null);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setRoomStatus(null);
  };

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

  /* ===== AMBIL DATA RUANGAN ===== */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms");
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Gagal mengambil data ruangan:", error);
      }
    };

    fetchRooms();
  }, []);

  /* ===== AMBIL STATUS REAL-TIME RUANGAN ===== */
  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const fetchRoomStatus = async () => {
      try {
        const response = await fetch(`/api/rooms/${selectedRoom.id}/status`);
        const data = await response.json();
        setRoomStatus(data);
      } catch (error) {
        console.error("Gagal mengambil status ruangan:", error);
      }
    };

    fetchRoomStatus();

    const interval = setInterval(() => {
      fetchRoomStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedRoom]);

  /* ===== AUTO SCROLL KE DETAIL LOKASI ===== */
  useEffect(() => {
    if (selectedRoom && detailLocationRef.current) {
      detailLocationRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedRoom]);

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
        {/* ===== HEADER NAVIGASI ===== */}
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
              NAVIPUS • CAMPUS GUIDE
            </span>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Navigasi Kampus
          </h1>

          <p
            className={`mt-3 text-base ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Temukan gedung, ruangan, fasilitas, dan status ketersediaan ruang
            di lingkungan kampus secara real-time.
          </p>
        </header>

        {/* ===== CAMPUS MAP ===== */}
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
            🗺️ Campus Map
          </h2>

          <p
            className={`mt-1.5 text-sm ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Lihat lokasi gedung dan fasilitas kampus pada peta.
          </p>

          <div
            className={`mt-4 overflow-hidden rounded-2xl border ${
              isDark ? "border-white/15" : "border-slate-200/80"
            }`}
          >
            <CampusMap />
          </div>
        </section>

        {/* ===== PENCARIAN RUANGAN ===== */}
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
            🔎 Cari Ruangan
          </h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Contoh: Lab Elektro"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`flex-1 rounded-xl border px-4 py-3 outline-none transition ${
                isDark
                  ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-black/60 focus:ring-2 focus:ring-blue-500/30"
                  : "border-slate-300/80 bg-white/80 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              }`}
            />

            <button
              type="button"
              onClick={() => setSearch(search)}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 transition duration-200 hover:brightness-110 active:scale-[0.99]"
            >
              Cari
            </button>
          </div>
        </section>

        {/* ===== HASIL DATA RUANGAN ===== */}
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
            📍 Daftar Ruangan
          </h2>

          <div className="mt-4 space-y-4">
            {rooms.length > 0 ? (
              rooms
                .filter((room) =>
                  room.nama_ruangan.toLowerCase().includes(search.toLowerCase())
                )
                .map((room) => (
                  <div
                    key={room.id}
                    className={`rounded-2xl border p-5 transition-all duration-200 ${
                      isDark
                        ? "border-white/10 bg-black/30 hover:border-blue-400/40 hover:bg-black/50"
                        : "border-slate-200/80 bg-white/75 hover:border-blue-400 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {room.nama_ruangan}
                        </h3>

                        <p
                          className={`mt-1 text-sm ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          🏢 {room.nama_gedung} • Lantai {room.lantai}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRoomSelect(room)}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                          isDark
                            ? "border border-blue-400/30 bg-blue-600/20 text-blue-200 hover:bg-blue-600 hover:text-white"
                            : "bg-slate-900 text-white hover:bg-blue-700"
                        }`}
                      >
                        Lihat Rute
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Memuat data ruangan...
              </p>
            )}
          </div>
        </section>

        {/* ===== DETAIL RUTE ===== */}
        {selectedRoom && (
          <section
            ref={detailLocationRef}
            className={`mb-6 rounded-3xl border p-6 backdrop-blur-xl transition-all ${
              isDark
                ? "border-blue-400/30 bg-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"
                : "border-blue-300 bg-white/80 shadow-[0_8px_32px_0_rgba(30,58,138,0.15)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                🧭 Detail Lokasi
              </h2>

              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  isDark
                    ? "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                    : "bg-slate-200/80 text-slate-600 hover:bg-slate-300"
                }`}
              >
                Tutup ✕
              </button>
            </div>

            <div
              className={`mt-4 rounded-2xl border p-5 ${
                isDark
                  ? "border-white/10 bg-black/35"
                  : "border-slate-200/80 bg-white/85"
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {selectedRoom.nama_ruangan}
              </h3>

              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                📍 {selectedRoom.nama_gedung}
              </p>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                🏢 Lantai {selectedRoom.lantai}
              </p>

              {/* ===== STATUS RUANGAN ===== */}
              <div
                className={`mt-4 rounded-xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-slate-200/80 bg-slate-50/80"
                }`}
              >
                <h3
                  className={`text-sm font-bold ${
                    isDark ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  Status Ruangan
                </h3>

                {roomStatus ? (
                  <div className="mt-3">
                    {roomStatus.status === "digunakan" ? (
                      <div
                        className={`rounded-xl border p-4 ${
                          isDark
                            ? "border-red-500/30 bg-red-500/15 text-red-200"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}
                      >
                        <p className="font-semibold">🔴 Sedang digunakan</p>
                        <p className="mt-1 text-sm">{roomStatus.kegiatan}</p>
                        <p className="mt-1 text-sm">
                          {roomStatus.mulai} - {roomStatus.selesai}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl border p-4 ${
                          isDark
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        <p className="font-semibold">🟢 Tersedia</p>
                        <p className="mt-1 text-sm">
                          Tidak ada kegiatan yang sedang berlangsung.
                        </p>
                      </div>
                    )}

                    <p
                      className={`mt-3 text-xs ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      🕐 Waktu: {roomStatus.hari}, {roomStatus.waktu} WITA
                    </p>
                  </div>
                ) : (
                  <p
                    className={`mt-3 text-sm ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Memuat status ruangan...
                  </p>
                )}
              </div>

              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  isDark
                    ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                    : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                🧭 Rute menuju <strong>{selectedRoom.nama_ruangan}</strong> akan
                ditampilkan di sini.
              </div>
            </div>
          </section>
        )}

        {/* ===== FASILITAS KAMPUS ===== */}
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
            🏫 Fasilitas Kampus
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* ===== FASILITAS PERPUSTAKAAN ===== */}
            <div
              className={`rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] ${
                isDark
                  ? "border-white/10 bg-black/30 hover:border-blue-400/40"
                  : "border-slate-200/80 bg-white/75 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <h3
                className={`font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                📚 Perpustakaan
              </h3>

              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Tempat membaca dan mencari referensi akademik.
              </p>
            </div>

            {/* ===== FASILITAS LABORATORIUM ===== */}
            <div
              className={`rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] ${
                isDark
                  ? "border-white/10 bg-black/30 hover:border-red-400/40"
                  : "border-slate-200/80 bg-white/75 hover:border-red-300 hover:shadow-md"
              }`}
            >
              <h3
                className={`font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                🧪 Laboratorium
              </h3>

              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Laboratorium untuk kegiatan praktikum mahasiswa.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}