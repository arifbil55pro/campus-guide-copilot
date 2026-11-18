"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingLetter, setPendingLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  const messagesEndRef = useRef(null);

  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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

  /* ===== CEK SESI LOGIN MAHASISWA ===== */
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();
        setStudent(data.student);
      } catch (error) {
        console.error("Session Check Error:", error);
        router.replace("/login");
      } finally {
        setIsCheckingSession(false);
      }
    }

    loadSession();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  };

  /* ===== SUGGESTION CHIPS ===== */
  const suggestions = [
    "Di mana lokasi Perpustakaan?",
    "Di mana letak Gedung Kuliah Terpadu",
    "Di mana letak Gedung Informatika",
    "Jadwal kuliah semester ini",
  ];

  /* ===== AUTO SCROLL ===== */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /* ===== FUNGSI RESET CHAT ===== */
  const handleReset = () => {
    setMessages([]);
    setPendingLetter(null);
  };

  /* ===== FUNGSI KIRIM PESAN ===== */
  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      text: messageText,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const lowerInput = messageText.toLowerCase().trim();
      const isConfirmation = Boolean(
        pendingLetter &&
          (lowerInput === "ya" ||
            lowerInput === "iya" ||
            lowerInput === "iyaa" ||
            lowerInput === "ya, simpan" ||
            lowerInput === "iya, simpan" ||
            lowerInput === "setuju" ||
            lowerInput === "simpan")
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          messages: [...messages, userMessage],
          nim: student.nim,
          confirmed: isConfirmation,
          pendingLetter: isConfirmation ? pendingLetter : null,
        }),
      });

      const data = await response.json();

      if (data.preview === true && data.pendingLetter) {
        setPendingLetter(data.pendingLetter);
      }

      if (isConfirmation && !data.pendingLetter) {
        setPendingLetter(null);
      }

      const botMessage = {
        role: "assistant",
        text: data.reply || "Maaf, tidak ada respon dari server.",
      };

      setMessages((currentMessages) => [...currentMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        text: "Maaf, terjadi kesalahan saat menghubungi server.",
      };
      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isThemeReady) {
    return <main className="min-h-screen bg-transparent" />;
  }

  if (isCheckingSession || !student) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-[#070B14] text-slate-300"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-red-50/60 text-slate-600"
        }`}
      >
        <div
          className={`rounded-2xl border px-6 py-4 text-sm font-medium backdrop-blur-xl ${
            isDark
              ? "border-white/15 bg-white/[0.06]"
              : "border-white/90 bg-white/70 shadow-sm"
          }`}
        >
          Memeriksa sesi login...
        </div>
      </main>
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden px-4 pt-20 pb-8 transition-colors duration-300 md:px-6 md:py-12 ${
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
      <div
        className={`pointer-events-none fixed top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${
          isDark ? "bg-indigo-500/10" : "bg-blue-300/20"
        }`}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* ===== HEADER ===== */}
        <header
          className={`mb-8 flex items-start justify-between gap-4 border-b pb-6 ${
            isDark ? "border-white/10" : "border-blue-200/70"
          }`}
        >
          <div>
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                isDark
                  ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                  : "border-blue-600/25 bg-blue-600/10 text-blue-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                  isDark ? "bg-blue-400" : "bg-blue-600"
                }`}
              ></span>
              NAVIPUS
            </div>
            <h1
              className={`bg-gradient-to-r bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl ${
                isDark
                  ? "from-white via-blue-200 to-red-400"
                  : "from-blue-950 via-indigo-900 to-red-600"
              }`}
            >
              Your AI Companion for Campus Life
            </h1>
            <p
              className={`mt-2 text-sm md:text-base ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Asisten AI untuk membantu mahasiswa menemukan informasi akademik,
              lokasi kampus, dan layanan mahasiswa.
            </p>
          </div>
          <div
            className={`shrink-0 rounded-2xl border p-2 backdrop-blur-md ${
              isDark
                ? "border-white/15 bg-white/10"
                : "border-white/90 bg-white/75 shadow-sm"
            }`}
          >
            <Image
              src="/logo-politala.png"
              alt="Logo POLITALA"
              width={80}
              height={80}
              className="h-auto w-14 md:w-16 drop-shadow-sm"
            />
          </div>
        </header>

        {/* ===== CHAT SECTION ===== */}
        <section
          className={`mb-8 flex flex-col rounded-3xl border p-4 backdrop-blur-xl transition-all md:p-6 ${
            isDark
              ? "border-white/15 bg-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]"
              : "border-white/90 bg-white/65 shadow-[0_8px_32px_0_rgba(30,58,138,0.12)]"
          }`}
        >
          {/* Aksen Garis Tipis Gradasi Merah-Putih-Biru */}
          <div
            className={`mb-4 h-1 w-20 rounded-full bg-gradient-to-r ${
              isDark
                ? "from-red-500 via-white to-blue-500 opacity-80"
                : "from-red-600 via-slate-300 to-blue-600 opacity-90"
            }`}
          />

          {/* HEADER CHAT + STATUS INDICATOR + RESET BUTTON */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
              isDark ? "border-white/10" : "border-slate-200/70"
            }`}
          >
            <div>
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                👋 Halo, {student.nama}!
              </h2>
              <p
                className={`mt-0.5 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Ada yang bisa saya bantu hari ini?
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleLogout}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isDark
                    ? "border-white/15 bg-white/5 text-slate-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                Keluar
              </button>

              {/* TOMBOL RESET CHAT */}
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                    isDark
                      ? "border-white/15 bg-white/5 text-slate-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
                      : "border-slate-200/80 bg-slate-50/90 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  }`}
                  title="Hapus riwayat chat"
                >
                  <span>🔄</span> Reset
                </button>
              )}

              {/* STATUS INDICATOR BADGE */}
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  isDark
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-emerald-500/20 bg-emerald-50/90 text-emerald-700"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>AI Active</span>
              </div>
            </div>
          </div>

          {/* ===== MESSAGES CONTAINER ===== */}
          <div
            className={`mt-4 flex max-h-[450px] min-h-[250px] flex-col gap-4 overflow-y-auto rounded-2xl border p-4 shadow-inner ${
              isDark
                ? "border-white/10 bg-black/35"
                : "border-blue-100/80 bg-white/50"
            }`}
          >
            {messages.length === 0 && (
              <div
                className={`my-auto text-center text-sm ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                Belum ada percakapan. Ketik pesan atau pilih topik rekomendasi di
                bawah!
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2.5 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AVATAR NAVIPUS (ASSISTANT) */}
                {message.role === "assistant" && (
                  <div className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-red-600 text-sm text-white shadow-sm">
                    🤖
                  </div>
                )}

                {/* BUBBLE CONTENT */}
                <div
                  className={`flex max-w-[80%] flex-col md:max-w-[85%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span
                    className={`mb-1 px-1 text-[10px] font-semibold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {message.role === "user" ? student.nama : "NAVIPUS"}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all ${
                      message.role === "user"
                        ? "rounded-br-none bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white shadow-blue-900/20"
                        : isDark
                        ? "rounded-bl-none border border-white/15 bg-white/10 text-slate-100 backdrop-blur-md"
                        : "rounded-bl-none border border-slate-200/80 bg-white/90 text-slate-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>

                {/* AVATAR MAHASISWA (USER) */}
                {message.role === "user" && (
                  <div
                    className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm shadow-xs ${
                      isDark
                        ? "border-white/15 bg-white/10 text-slate-200"
                        : "border-slate-200 bg-slate-200 text-slate-700"
                    }`}
                  >
                    🎓
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR WITH AVATAR */}
            {isLoading && (
              <div className="flex items-end justify-start gap-2.5">
                <div className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-red-600 text-sm text-white shadow-sm">
                  🤖
                </div>
                <div className="flex flex-col items-start">
                  <span
                    className={`mb-1 px-1 text-[10px] font-semibold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    NAVIPUS
                  </span>
                  <div
                    className={`flex items-center gap-2 rounded-2xl rounded-bl-none border px-4 py-3 text-sm shadow-sm ${
                      isDark
                        ? "border-white/15 bg-white/10 text-slate-300 backdrop-blur-md"
                        : "border-slate-200 bg-white/90 text-slate-500"
                    }`}
                  >
                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.3s]"></div>
                    <span
                      className={`ml-1 text-xs font-medium ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      Sedang mengetik...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ===== SUGGESTION CHIPS ===== */}
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
                  isDark
                    ? "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:border-blue-400 hover:bg-blue-600 hover:text-white"
                    : "border-blue-200/80 bg-white/80 text-blue-700 shadow-xs hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                💡 {chip}
              </button>
            ))}
          </div>

          {/* ===== CHAT INPUT ===== */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              placeholder="Tanya tentang kampus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition disabled:opacity-60 ${
                isDark
                  ? "border-white/15 bg-black/40 text-white placeholder-slate-500 focus:border-blue-400 focus:bg-black/60 focus:ring-2 focus:ring-blue-500/30"
                  : "border-slate-300/80 bg-white/85 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tanya
            </button>
          </form>
        </section>

        {/* ===== CARDS SECTION ===== */}
        <section>
          <h2
            className={`mb-4 text-lg font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Pintasan Layanan
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/akademik">
              <div
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                  isDark
                    ? "border-white/15 bg-white/[0.06] hover:border-blue-400/50 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-blue-950/50"
                    : "border-white/90 bg-white/70 shadow-sm hover:border-blue-300 hover:bg-white/90 hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                    isDark
                      ? "bg-blue-500/15 text-blue-300 group-hover:bg-blue-600 group-hover:text-white"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  }`}
                >
                  📚
                </div>
                <h3
                  className={`mt-3 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Akademik
                </h3>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  KRS, jadwal kuliah, dosen wali, dan prosedur akademik.
                </p>
              </div>
            </Link>

            <Link href="/navigasi">
              <div
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                  isDark
                    ? "border-white/15 bg-white/[0.06] hover:border-indigo-400/50 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-indigo-950/50"
                    : "border-white/90 bg-white/70 shadow-sm hover:border-indigo-300 hover:bg-white/90 hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                    isDark
                      ? "bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white"
                      : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                  }`}
                >
                  🗺️
                </div>
                <h3
                  className={`mt-3 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Navigasi Kampus
                </h3>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  Cari ruangan, gedung, fasilitas, dan peta kampus.
                </p>
              </div>
            </Link>

            <Link href="/layanan">
              <div
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 ${
                  isDark
                    ? "border-white/15 bg-white/[0.06] hover:border-red-400/50 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-red-950/50"
                    : "border-white/90 bg-white/70 shadow-sm hover:border-red-300 hover:bg-white/90 hover:shadow-md"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                    isDark
                      ? "bg-red-500/15 text-red-300 group-hover:bg-red-600 group-hover:text-white"
                      : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                  }`}
                >
                  🏢
                </div>
                <h3
                  className={`mt-3 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Layanan Mahasiswa
                </h3>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  Informasi beasiswa, surat kelakuan baik, dan layanan kampus.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}