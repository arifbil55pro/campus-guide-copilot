"use client";

import { useEffect, useState } from "react";

export default function CampusMap() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapType, setMapType] = useState("m"); // 'm' = Roadmap, 'k' = Satellite
  const [zoom, setZoom] = useState(17);

  /* ===== AMBIL DATA LOKASI DARI DATABASE ===== */
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/locations");
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil data lokasi:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setZoom(18);
  };

  const handleResetLocation = () => {
    setSelectedLocation(null);
    setZoom(17);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 14));
  };

  /* ===== URL EMBED GOOGLE MAPS DINAMIS ===== */
  const mapQuery = selectedLocation
    ? `${Number(selectedLocation.latitude)},${Number(selectedLocation.longitude)}`
    : "Politeknik Negeri Tanah Laut";

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-4">
      {/* ===== KONTROL MODE PETA, ZOOM & RESET ===== */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMapType("m")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              mapType === "m"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            🗺️ Peta Jalan
          </button>
          <button
            type="button"
            onClick={() => setMapType("k")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              mapType === "k"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            🛰️ Satelit
          </button>

          {/* KONTROL ZOOM IN / OUT */}
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-300/70 bg-white/15 backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 14}
              aria-label="Perkecil peta"
              title="Zoom Out (-)"
              className="px-3 py-1.5 text-sm font-bold transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span className="border-x border-slate-300/40 px-2.5 py-1.5 text-[11px] font-semibold">
              {zoom}x
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 20}
              aria-label="Perbesar peta"
              title="Zoom In (+)"
              className="px-3 py-1.5 text-sm font-bold transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {selectedLocation && (
          <button
            type="button"
            onClick={handleResetLocation}
            className="rounded-xl border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-500 transition hover:bg-blue-600 hover:text-white"
          >
            ↺ Reset ke Kampus Politala
          </button>
        )}
      </div>

      {/* ===== IFRAME GOOGLE MAPS ===== */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/15 shadow-inner">
        <iframe
          key={embedUrl}
          title="Peta Kampus Politeknik Negeri Tanah Laut"
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* ===== INFO LOKASI TERPILIH ===== */}
      {selectedLocation && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-blue-400">
              📍 {selectedLocation.nama}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              Tipe: {selectedLocation.tipe} • Koordinat:{" "}
              {Number(selectedLocation.latitude).toFixed(6)},{" "}
              {Number(selectedLocation.longitude).toFixed(6)}
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${Number(
              selectedLocation.latitude
            )},${Number(selectedLocation.longitude)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            🧭 Buka Rute di Google Maps
          </a>
        </div>
      )}

      {/* ===== DAFTAR PIN LOKASI DARI DATABASE ===== */}
      {locations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold opacity-75">
            📌 Titik Lokasi Kampus ({locations.length} lokasi terdaftar):
          </p>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => {
              const isSelected = selectedLocation?.id === location.id;
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-300/60 bg-white/10 hover:border-blue-400 hover:bg-blue-500/15"
                  }`}
                >
                  📍 {location.nama}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}