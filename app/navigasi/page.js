
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/* ===== LOAD CAMPUS MAP ===== */

const CampusMap = dynamic(
  () => import("./Map"),
  {
    ssr: false,
  }
);

export default function NavigasiPage() {
        const handleRoomSelect = (room) => {
          setSelectedRoom(room);
          setRoomStatus(null);
        };

        {/* ===== STATE DATA RUANGAN ===== */}

        const [rooms, setRooms] = useState([]);
        
        /* ===== STATE PENCARIAN ===== */

        const [search, setSearch] = useState("");

        /* ===== STATE RUANGAN TERPILIH ===== */

        const [selectedRoom, setSelectedRoom] = useState(null);

        /* ===== STATE STATUS RUANGAN ===== */

        const [roomStatus, setRoomStatus] = useState(null);

        /* ===== REFERENSI DETAIL LOKASI ===== */

        const detailLocationRef = useRef(null);


        {/* ===== AMBIL DATA RUANGAN ===== */}

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
                const response = await fetch(
                  `/api/rooms/${selectedRoom.id}/status`
                );

                const data = await response.json();

                setRoomStatus(data);
              } catch (error) {
                console.error("Gagal mengambil status ruangan:", error);
              }
            };

            /* ===== CEK STATUS SAAT RUANGAN DIPILIH ===== */

            fetchRoomStatus();

            /* ===== CEK ULANG SETIAP 1 MENIT ===== */

            const interval = setInterval(() => {
              fetchRoomStatus();
            }, 60000);

            /* ===== HENTIKAN INTERVAL ===== */

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



  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        {/* ===== HEADER NAVIGASI ===== */}
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            CAMPUS GUIDE COPILOT
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Navigasi Kampus
          </h1>

          <p className="mt-3 text-slate-600">
            Temukan gedung, ruangan, fasilitas, dan lokasi penting
            di lingkungan kampus.
          </p>
        </header>

      {/* ===== CAMPUS MAP ===== */}

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            🗺️ Campus Map
          </h2>

          <p className="mt-2 text-slate-600">
            Lihat lokasi gedung dan fasilitas kampus pada peta.
          </p>

          <div className="mt-4">
            <CampusMap />
          </div>

        </section>

        {/* ===== PENCARIAN RUANGAN ===== */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          {/* ===== JUDUL PENCARIAN ===== */}
          <h2 className="text-xl font-semibold text-slate-900">
            🔎 Cari Ruangan
          </h2>

          {/* ===== INPUT PENCARIAN ===== */}
          <div className="mt-4 flex gap-3">
           <input
            type="text"
            placeholder="Contoh: Lab Elektro"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

            <button
              onClick={() => setSearch(search)}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Cari
            </button>
          </div>
        </section>

        {/* ===== HASIL DATA RUANGAN ===== */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-slate-900">
          📍 Daftar Ruangan
        </h2>

        <div className="mt-4 space-y-4">

          {rooms.length > 0 ? (
              rooms
                .filter((room) =>
                  room.nama_ruangan
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                  .map((room) => (
              /* ===== KARTU RUANGAN ===== */
              <div
                key={room.id}
                className="rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:shadow-md"
              >

                <h3 className="font-semibold text-slate-900">
                  {room.nama_ruangan}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {room.nama_gedung}
                </p>

                <p className="text-sm text-slate-600">
                  Lantai {room.lantai}
                </p>

               <button
                  onClick={() => handleRoomSelect(room)}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Lihat Rute
                </button>

              </div>
            ))
          ) : (
            <p className="text-slate-500">
              Memuat data ruangan...
            </p>
          )}

        </div>
      </section>

          {/* ===== DETAIL RUTE ===== */}

         {selectedRoom && (
          <section
            ref={detailLocationRef}
            className="mb-6 rounded-2xl bg-white p-6 shadow-sm"
          >

              <h2 className="text-xl font-semibold text-slate-900">
                🧭 Detail Lokasi
              </h2>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">

                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedRoom.nama_ruangan}
                </h3>

                <p className="mt-2 text-slate-600">
                  📍 {selectedRoom.nama_gedung}
                </p>

                <p className="text-slate-600">
                  🏢 Lantai {selectedRoom.lantai}
                </p>

                {/* ===== STATUS RUANGAN ===== */}

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">
                    Status Ruangan
                  </h3>

                  {roomStatus ? (
                    <div className="mt-3">
                      {roomStatus.status === "digunakan" ? (
                        <div className="rounded-xl bg-red-50 p-4 text-red-800">
                          <p className="font-semibold">
                            🔴 Sedang digunakan
                          </p>

                          <p className="mt-1 text-sm">
                            {roomStatus.kegiatan}
                          </p>

                          <p className="mt-1 text-sm">
                            {roomStatus.mulai} - {roomStatus.selesai}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-green-50 p-4 text-green-800">
                          <p className="font-semibold">
                            🟢 Tersedia
                          </p>

                          <p className="mt-1 text-sm">
                            Tidak ada kegiatan yang sedang berlangsung.
                          </p>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        🕐 Waktu: {roomStatus.hari}, {roomStatus.waktu} WITA
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Memuat status ruangan...
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-blue-50 p-4 text-blue-800">
                  🧭 Rute menuju {selectedRoom.nama_ruangan} akan
                  ditampilkan di sini.
                </div>

              </div>
            </section>
          )}

        {/* ===== FASILITAS KAMPUS ===== */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            🏫 Fasilitas Kampus
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            {/* ===== FASILITAS PERPUSTAKAAN ===== */}
            <div className="rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md">

              <h3 className="font-semibold text-slate-900">
                📚 Perpustakaan
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Tempat membaca dan mencari referensi akademik.
              </p>

            </div>


            {/* ===== FASILITAS LABORATORIUM ===== */}
            <div className="rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md">

              <h3 className="font-semibold text-slate-900">
                🧪 Laboratorium
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Laboratorium untuk kegiatan praktikum mahasiswa.
              </p>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}