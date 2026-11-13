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

  const messagesEndRef = useRef(null);

  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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
    "Cek status KRS saya",
    "Buat draft permohonan KRS terlambat",
    "Di mana lokasi Perpustakaan?",
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

  if (isCheckingSession || !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Memeriksa sesi login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50/70 via-slate-50 to-red-50/30 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* ===== HEADER ===== */}
        <header className="mb-8 flex items-start justify-between gap-6 border-b border-blue-100/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-500/20 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              NAVIPUS
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-950 via-indigo-900 to-red-600 bg-clip-text text-transparent md:text-4xl">
            Your AI Companion for Campus Life
            </h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Asisten AI untuk membantu mahasiswa menemukan informasi akademik, lokasi kampus, dan layanan mahasiswa.
            </p>
          </div>
          <Image
            src="/logo-politala.png"
            alt="Logo POLITALA"
            width={80}
            height={80}
            className="h-auto w-16 md:w-20 drop-shadow-sm"
          />
        </header>

        {/* ===== CHAT SECTION ===== */}
        <section className="mb-8 flex flex-col rounded-3xl bg-white/90 backdrop-blur-md p-4 shadow-xl shadow-blue-950/5 ring-1 ring-blue-100/80 md:p-6 transition-all">
          {/* HEADER CHAT + STATUS INDICATOR + RESET BUTTON */}
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                👋 Halo, {student.nama}!
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Ada yang bisa saya bantu hari ini?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Keluar
              </button>
              {/* TOMBOL RESET CHAT */}
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
                  title="Hapus riwayat chat"
                >
                  <span>🔄</span> Reset
                </button>
              )}

              {/* STATUS INDICATOR BADGE */}
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>AI Active</span>
              </div>
            </div>
          </div>

          {/* ===== MESSAGES CONTAINER ===== */}
          <div className="mt-4 flex max-h-[450px] min-h-[250px] flex-col gap-4 overflow-y-auto rounded-2xl bg-blue-50/30 p-4 border border-blue-100/60 shadow-inner">
            {messages.length === 0 && (
              <div className="my-auto text-center text-slate-400 text-sm">
                Belum ada percakapan. Ketik pesan atau pilih topik rekomendasi di bawah!
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2.5 items-end ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AVATAR NAVIPUS (ASSISTANT) */}
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm text-white shadow-xs mb-0.5">
                    🤖
                  </div>
                )}

                {/* BUBBLE CONTENT */}
                <div
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  } max-w-[80%] md:max-w-[85%]`}
                >
                  <span className="mb-1 text-[10px] font-semibold text-slate-400 px-1">
                    {message.role === "user" ? student.nama : "NAVIPUS"}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-500/10"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-slate-200/50"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>

                {/* AVATAR MAHASISWA (USER) */}
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm text-slate-700 shadow-xs mb-0.5">
                    🎓
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR WITH AVATAR */}
            {isLoading && (
              <div className="flex gap-2.5 items-end justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm text-white shadow-xs mb-0.5">
                  🤖
                </div>
                <div className="flex flex-col items-start">
                  <span className="mb-1 text-[10px] font-semibold text-slate-400 px-1">
                    NAVIPUS
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                    <span className="ml-1 text-xs text-slate-400 font-medium">Sedang mengetik...</span>
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
                className="rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-xs transition hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 disabled:opacity-50"
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
              className="flex-1 rounded-xl border border-blue-200/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 shadow-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:bg-none disabled:bg-slate-300"
            >
              Tanya
            </button>
          </form>
        </section>

        {/* ===== CARDS SECTION ===== */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Pintasan Layanan
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/akademik">
              <div className="group rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md ring-1 ring-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  📚
                </div>
                <h3 className="mt-3 font-bold text-slate-900">Akademik</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  KRS, jadwal kuliah, dosen wali, dan prosedur akademik.
                </p>
              </div>
            </Link>

            <Link href="/navigasi">
              <div className="group rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md ring-1 ring-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  🗺️
                </div>
                <h3 className="mt-3 font-bold text-slate-900">Navigasi Kampus</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Cari ruangan, gedung, fasilitas, dan peta kampus.
                </p>
              </div>
            </Link>

            <Link href="/layanan">
              <div className="group rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-md ring-1 ring-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  🏢
                </div>
                <h3 className="mt-3 font-bold text-slate-900">Layanan Mahasiswa</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
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