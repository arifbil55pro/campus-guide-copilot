import { GoogleGenAI } from "@google/genai";
import pool from "@/lib/db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ===== TOOL FIND LOCATION ===== */

const findLocationTool = {
  functionDeclarations: [
    {
      name: "find_location",
      description:
        "Mencari lokasi atau gedung kampus berdasarkan nama dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          nama: {
            type: "STRING",
            description: "Nama lokasi yang ingin dicari.",
          },
        },
        required: ["nama"],
      },
    },
  ],
};


/* ===== TOOL FIND SERVICE ===== */

const findServiceTool = {
  functionDeclarations: [
    {
      name: "find_service",
      description:
        "Mencari informasi layanan mahasiswa berdasarkan nama layanan dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          nama: {
            type: "STRING",
            description: "Nama layanan mahasiswa yang ingin dicari.",
          },
        },
        required: ["nama"],
      },
    },
  ],
};



/* ===== TOOL FIND ROOM ===== */

const findRoomTool = {
  functionDeclarations: [
    {
      name: "find_room",
      description:
        "Mencari ruangan atau laboratorium kampus berdasarkan nama dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          nama: {
            type: "STRING",
            description: "Nama ruangan atau laboratorium yang ingin dicari.",
          },
        },
        required: ["nama"],
      },
    },
  ],
};

/* ===== TOOL CHECK KRS STATUS ===== */

const checkKrsStatusTool = {

  
  functionDeclarations: [

    {

      name: "check_krs_status",

      description:
        "Mengecek status KRS mahasiswa berdasarkan NIM dari database kampus.",

      parameters: {

        type: "OBJECT",

        properties: {

          nim: {

            type: "STRING",

            description: "NIM mahasiswa yang ingin dicek status KRS-nya.",

          },

        },

        required: ["nim"],

      },

    },

  ],

};

/* ===== TOOL GET ADVISOR ===== */

const getAdvisorTool = {
  functionDeclarations: [
    {
      name: "get_advisor",
      description:
        "Mengambil informasi dosen wali mahasiswa berdasarkan NIM dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          nim: {
            type: "STRING",
            description:
              "NIM mahasiswa yang ingin diketahui dosen walinya.",
          },
        },
        required: ["nim"],
      },
    },
  ],
};

/* ===== TOOL GET SCHEDULE ===== */

const getScheduleTool = {
  functionDeclarations: [
    {
      name: "get_schedule",
      description:
        "Mengambil jadwal kegiatan kampus berdasarkan hari dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          hari: {
            type: "STRING",
            description:
              "Hari yang ingin dicari jadwalnya, misalnya Senin, Selasa, atau Rabu.",
          },
        },
        required: ["hari"],
      },
    },
  ],
};

/* ===== TOOL GET ROOM STATUS ===== */

const getRoomStatusTool = {
  functionDeclarations: [
    {
      name: "get_room_status",
      description:
        "Mengecek apakah suatu ruangan sedang digunakan atau kosong berdasarkan nama ruangan, hari, dan jam.",
      parameters: {
        type: "OBJECT",
        properties: {
          room: {
            type: "STRING",
            description:
              "Nama ruangan atau laboratorium yang ingin dicek.",
          },

          hari: {
            type: "STRING",
            description:
              "Hari yang ingin dicek, misalnya Senin, Selasa, atau Rabu.",
          },

          jam: {
            type: "STRING",
            description:
              "Jam yang ingin dicek dengan format HH:MM, misalnya 09:00.",
          },
        },
        required: ["room", "hari", "jam"],
      },
    },
  ],
};

/* ===== TOOL CREATE LETTER ===== */

const createLetterTool = {
  functionDeclarations: [
    {
      name: "create_letter",

      description:
        "Menyimpan draft surat mahasiswa ke database SETELAH pengguna memberikan konfirmasi. Tool ini tidak boleh digunakan sebelum pengguna menyetujui preview surat.",

      parameters: {
        type: "OBJECT",

        properties: {
          nim: {
            type: "STRING",
            description:
              "NIM mahasiswa yang membuat surat.",
          },

          jenis_surat: {
            type: "STRING",
            description:
              "Jenis surat yang ingin dibuat.",
          },

          alasan: {
            type: "STRING",
            description:
              "Alasan surat berdasarkan informasi yang diberikan pengguna.",
          },

          isi_surat: {
            type: "STRING",
            description:
              "Isi surat yang sudah ditampilkan kepada pengguna dalam preview.",
          },

          konfirmasi: {
            type: "BOOLEAN",
            description:
              "Harus bernilai true hanya jika pengguna sudah secara jelas mengonfirmasi untuk menyimpan draft.",
          },
        },

        required: [
          "nim",
          "jenis_surat",
          "alasan",
          "isi_surat",
          "konfirmasi",
        ],
      },
    },
  ],
};

  /* ===== TOOL GET STUDENT INFO ===== */

const getStudentInfoTool = {
  functionDeclarations: [
    {
      name: "get_student_info",
      description:
        "Mengambil informasi mahasiswa berdasarkan NIM dari database kampus.",
      parameters: {
        type: "OBJECT",
        properties: {
          nim: {
            type: "STRING",
            description: "Nomor Induk Mahasiswa (NIM) yang ingin dicari.",
          },
        },
        required: ["nim"],
      },
    },
  ],
};

/* ===== FUNGSI DELAY ===== */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/* ===== FUNGSI GEMINI DENGAN TOOL CALLING ===== */

async function generateWithRetry(
  message,
  messages = [],
  nim = null,
  maxRetries = 3,
  confirmed = false,
  pendingLetter = null
) {



  for (let attempt = 0; attempt <= maxRetries; attempt++) {

    try {

      console.log(
        `Gemini attempt ${attempt + 1}/${maxRetries + 1}`
      );

          /* ===== KONFIRMASI SIMPAN DRAFT SURAT ===== */

    if (confirmed === true && pendingLetter) {

      console.log(
        "User mengonfirmasi penyimpanan draft surat."
      );

      const {
        nim,
        jenis_surat,
        alasan,
        isi_surat,
      } = pendingLetter;
       
      console.log("PENDING LETTER SAAT KONFIRMASI:", pendingLetter);

      /* ===== CARI DATA MAHASISWA ===== */

      const studentResult =
        await pool.query(
          `
          SELECT
            students.id,
            students.nim,
            students.nama,
            students.prodi,
            students.semester,
            students.dosen_wali_id,
            lecturers.nama AS dosen_wali
          FROM students
          LEFT JOIN lecturers
            ON students.dosen_wali_id = lecturers.id
          WHERE students.nim = $1
          LIMIT 1;
          `,
          [nim]
        );


      /* ===== MAHASISWA TIDAK DITEMUKAN ===== */

      if (studentResult.rows.length === 0) {

        return {
          text:
            "Maaf, mahasiswa dengan NIM tersebut tidak ditemukan.",
        };

      }


      const student =
        studentResult.rows[0];


      /* ===== SIMPAN DRAFT SURAT ===== */

      const letterResult =
        await pool.query(
          `
          INSERT INTO letter_requests (
            student_id,
            dosen_wali_id,
            jenis_surat,
            alasan,
            isi_surat,
            status
          )
          VALUES ($1, $2, $3, $4, $5, 'draft')
          RETURNING
            id,
            jenis_surat,
            alasan,
            isi_surat,
            status,
            created_at;
          `,
          [
            student.id,
            student.dosen_wali_id,
            jenis_surat,
            alasan,
            isi_surat,
          ]
        );


      /* ===== HASIL PENYIMPANAN ===== */

      const surat =
        letterResult.rows[0];


      return {
        text: `
Draft surat berhasil disimpan.

**Jenis Surat:** ${surat.jenis_surat}

**Alasan:** ${surat.alasan}

**NIM:** ${student.nim}

**Nama:** ${student.nama}

**Program Studi:** ${student.prodi}

**Semester:** ${student.semester}

**Dosen Wali:** ${student.dosen_wali}

**Status:** DRAFT

Draft surat sudah tersimpan di database.
Surat belum dikirim dan belum disetujui.
        `.trim(),

        preview: false,

        pendingLetter: null,
      };
    }


    /* ===== CEK PERMINTAAN AWAL SURAT ===== */

const isLetterRequest =
  /surat/i.test(message);

const isLetterReason =
  !isLetterRequest &&
  /beasiswa|surat aktif|keperluan surat|pengajuan surat|terlambat.*krs|telat.*krs/i.test(
    message
  );

  const previousLetterRequest = messages.some(
  (msg) =>
    msg.role === "user" &&
    /surat/i.test(msg.text || "")
);

const shouldCreateLetterDraft =
  isLetterReason &&
  previousLetterRequest &&
  confirmed !== true &&
  !pendingLetter;

if (
  isLetterRequest &&
  confirmed !== true &&
  !pendingLetter
) {
  return {
    text:
      "Baik, saya bisa membantu membuat surat tersebut. Apa alasan atau keperluan surat yang Anda butuhkan?",
    preview: false,
    pendingLetter: null,
  };
}

    /* ===== LANJUTAN WORKFLOW SURAT ===== */

        console.log("WORKFLOW SURAT:", {
      isLetterReason,
      previousLetterRequest,
      shouldCreateLetterDraft,
      message,
      messages,
    });

if (shouldCreateLetterDraft) {
  const draftReason = message.trim();

  console.log("NIM UNTUK SURAT:", nim);

  const studentResult = await pool.query(
  `
  SELECT
    students.nim,
    students.nama,
    students.prodi,
    students.semester,
    students.dosen_wali_id,
    lecturers.nama AS dosen_wali
  FROM students
  LEFT JOIN lecturers
    ON students.dosen_wali_id = lecturers.id
  WHERE students.nim = $1
  LIMIT 1;
  `,
  [nim]
);



      const student = studentResult.rows[0];

      console.log("DATA MAHASISWA SURAT:", student);

      if (!student) {
        return {
          text: "Maaf, data mahasiswa tidak ditemukan.",
          preview: false,
          pendingLetter: null,
        };
      }

      const jenisSurat = "Surat Permohonan Keterlambatan Pengisian KRS";

      const isiSurat = `
      Dengan hormat,

      Saya yang bertanda tangan di bawah ini:

      NIM: ${student.nim}
      Nama: ${student.nama}
      Program Studi: ${student.prodi}
      Semester: ${student.semester}

      dengan ini mengajukan permohonan terkait keterlambatan melakukan pengisian KRS.

      Demikian permohonan ini saya sampaikan. Atas perhatian dan pertimbangannya, saya ucapkan terima kasih.

      Hormat saya,
      ${student.nama}
      `.trim();

            return {
        text: `Berikut draft surat berdasarkan alasan yang kamu berikan:

      **Jenis Surat:** ${jenisSurat}

      **Alasan:**
      "${draftReason}"

      **Isi Surat:**

      ${isiSurat}

      Silakan periksa draft tersebut. Jika sudah sesuai, kamu bisa mengonfirmasi untuk menyimpannya.`,
        preview: true,
        pendingLetter: {
          nim: student.nim,
          jenis_surat: jenisSurat,
          alasan: draftReason,
          isi_surat: isiSurat,
        },
      };
    }

     
      /* ===== REQUEST AWAL KE GEMINI ===== */

      let response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        config: {
          systemInstruction: `
Kamu adalah Campus Guide Copilot, asisten AI untuk membantu mahasiswa di lingkungan kampus.

KONTEKS MAHASISWA AKTIF:
- NIM mahasiswa aktif: ${nim || "belum diketahui"}
- NIM ini adalah identitas mahasiswa yang sedang menggunakan aplikasi.
- Jika NIM mahasiswa aktif tersedia, JANGAN meminta mahasiswa menyebutkan NIM lagi.
- Gunakan langsung NIM mahasiswa aktif saat membutuhkan data mahasiswa.

ATURAN WORKFLOW SURAT:
- Jika mahasiswa meminta membuat surat, jangan memanggil get_student_info atau get_advisor berulang kali.
- Gunakan NIM mahasiswa aktif untuk kebutuhan surat.
- Untuk permintaan surat, kumpulkan informasi yang diperlukan lalu gunakan tool create_letter.


Fokus utama kamu hanya pada 3 area berikut:

1. AKADEMIK
- KRS
- Dosen wali
- Jadwal kuliah
- Prosedur akademik
- Informasi akademik mahasiswa

2. NAVIGASI KAMPUS
- Gedung
- Ruangan
- Laboratorium
- Perpustakaan
- Fasilitas kampus
- Lokasi dan arah menuju tempat di kampus
- Gunakan data 'deskripsi_lokasi' untuk melanjutkan keberadaan gedung atau lokasi.
- JANGAN PERNAH menampilkan angka kordinat, latitude, atau longitude, atau longitude dalam balasanmu.

3. LAYANAN MAHASISWA
- Layanan administrasi mahasiswa
- Surat dan dokumen mahasiswa
- Lokasi layanan
- Jam pelayanan
- Prosedur layanan

ATURAN:

- Jawab dengan bahasa Indonesia yang jelas dan ramah.
- Jangan mengarang informasi spesifik tentang kampus.
- Gunakan hasil tool sebagai sumber informasi.
- Jika informasi tidak tersedia, katakan bahwa informasi tersebut belum tersedia.
- Jika pertanyaan tidak berkaitan dengan 3 area utama tersebut, jelaskan bahwa fokus kamu adalah membantu urusan akademik, navigasi kampus, dan layanan mahasiswa.

INFORMASI MAHASISWA:

- Jika membutuhkan informasi mahasiswa berdasarkan NIM, gunakan tool get_student_info.
- Jika membutuhkan status KRS mahasiswa berdasarkan NIM, gunakan tool check_krs_status.
- Jika membutuhkan informasi dosen wali mahasiswa berdasarkan NIM, gunakan tool get_advisor.
- Jika membutuhkan informasi jadwal berdasarkan hari, gunakan tool get_schedule.
- Jika membutuhkan status penggunaan ruangan berdasarkan hari dan jam, gunakan tool get_room_status.

NAVIGASI:

- Jika membutuhkan informasi gedung atau lokasi umum kampus, gunakan tool find_location.
- Jika membutuhkan informasi ruangan atau laboratorium, gunakan tool find_room.
- Jika membutuhkan informasi layanan mahasiswa, gunakan tool find_service.

PEMBUATAN DRAFT SURAT:

- Jika mahasiswa baru meminta membuat surat tetapi informasi alasan surat belum diberikan, jangan panggil get_student_info, get_advisor, atau create_letter.
- Tanyakan terlebih dahulu alasan atau keperluan surat kepada mahasiswa.
- Setelah alasan surat diberikan, gunakan NIM mahasiswa aktif untuk proses surat.
- Jangan memanggil get_student_info atau get_advisor berulang kali.
- Setelah informasi yang diperlukan tersedia, gunakan create_letter sesuai aturan konfirmasi.

ATURAN ISI SURAT:

- Alasan surat harus berdasarkan informasi yang diberikan pengguna.
- Jangan menambahkan alasan teknis, pribadi, keluarga, kesehatan, atau alasan lainnya yang tidak diberikan pengguna.
- Jika pengguna hanya mengatakan "telat KRS", gunakan alasan sederhana seperti "Terlambat melakukan pengisian KRS".
- Jangan mengarang informasi mahasiswa.
- Jangan mengarang nama dosen wali.
- Gunakan hasil tool sebagai sumber data.
- Draft surat harus ditampilkan terlebih dahulu sebelum disimpan.
- Jangan pernah menggunakan frasa seperti "karena kendala tertentu", "karena suatu kendala", "karena kesibukan", "karena masalah teknis", atau alasan lain yang tidak disebutkan pengguna.
- Jika pengguna hanya mengatakan "telat KRS", alasan harus tetap sederhana: "Terlambat melakukan pengisian KRS".
- Isi surat tidak boleh membuat penyebab keterlambatan yang tidak diberikan pengguna.

INFORMASI SURAT:

- NIM harus berasal dari mahasiswa atau hasil tool.
- Nama mahasiswa, program studi, semester, dan dosen wali harus berasal dari database.
- Jenis surat harus berdasarkan konteks permintaan mahasiswa.
- Alasan surat HARUS berdasarkan informasi yang diberikan mahasiswa.
- Jangan menambahkan alasan, penyebab, kondisi pribadi, kendala teknis, masalah keluarga, masalah kesehatan, atau keadaan lain yang tidak disebutkan mahasiswa.
- Jika mahasiswa hanya mengatakan "telat KRS", gunakan alasan yang sederhana seperti "Terlambat melakukan pengisian KRS".
- Jangan mengubah "telat KRS" menjadi alasan yang lebih spesifik.
- Isi surat boleh dibuat berdasarkan fakta yang diberikan mahasiswa dan data mahasiswa dari database.
- Isi surat TIDAK BOLEH menambahkan penyebab atau keadaan pribadi yang tidak diberikan mahasiswa.
- Jika informasi yang diperlukan untuk membuat surat belum cukup, jangan mengarang informasi tersebut.
- Tool create_letter hanya membuat draft surat dan tidak mengirim surat.
- Gunakan hasil create_letter sebagai sumber informasi utama untuk menjelaskan hasil kepada mahasiswa.
`,

          tools: [
            findLocationTool,
            findServiceTool,
            findRoomTool,
            checkKrsStatusTool,
            getAdvisorTool,
            getStudentInfoTool,
            getScheduleTool,
            getRoomStatusTool,
            createLetterTool,
          ],
        },

  contents: [
  ...messages.map((msg) => ({
    role: msg.role === "assistant"
      ? "model"
      : "user",

    parts: [
      {
      text: msg.text || "",
      },
    ],
  })),
],

});


      /* ===== LOOP MULTI-STEP TOOL ===== */

      const toolHistory = [];
      const toolResultsHistory = [];

      for (let toolStep = 0; toolStep < 10; toolStep++) {

        console.log(
          `Tool step ${toolStep + 1}`
        );


        /* ===== CEK APAKAH GEMINI MEMINTA TOOL ===== */

        const functionCall =
          response.functionCalls?.[0];


        /* ===== JIKA TIDAK ADA TOOL CALL ===== */

        if (!functionCall) {

          console.log(
            "Gemini memberikan jawaban akhir."
          );

          return response;
          }


              /* ===== CEK NAMA TOOL ===== */

              console.log(
                "Gemini memanggil tool:",
                functionCall.name
              );

              toolHistory.push(functionCall.name);

              if (toolHistory.length >= 3) {
        const lastThreeTools = toolHistory.slice(-3);

        if (
          lastThreeTools[0] === lastThreeTools[1] &&
          lastThreeTools[1] === lastThreeTools[2]
        ) {
          console.log(
            "Agent menghentikan loop tool:",
            functionCall.name
          );

          return {
            text: "Maaf, saya tidak dapat menyelesaikan permintaan tersebut.",
          };
        }
      }

                if (toolHistory.length >= 4) {
  const lastFourTools = toolHistory.slice(-4);

  if (
    lastFourTools[0] === lastFourTools[2] &&
    lastFourTools[1] === lastFourTools[3] &&
    lastFourTools[0] !== lastFourTools[1]
  ) {
    console.log(
      "Agent menghentikan pola tool berulang:",
      lastFourTools
    );

    // Tempatkan kode fallback Gemini DI SINI
    response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      config: {
        systemInstruction: `
Kamu adalah Campus Guide Copilot.

Agent sudah memperoleh hasil dari beberapa tool.

Jangan memanggil tool lagi.
Gunakan hasil tool yang sudah tersedia untuk menjawab pertanyaan user.
Gabungkan semua informasi yang relevan menjadi satu jawaban.
Jangan mengarang informasi.

Jawab dalam bahasa Indonesia yang jelas dan ramah.
`,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify(toolResultsHistory),
            },
          ],
        },
      ],
    });

    return response;
  }

}





        let toolResult;


        /* ================================================== */
        /* ===== TOOL FIND LOCATION ========================= */
        /* ================================================== */

        if (functionCall.name === "find_location") {

          const nama =
            functionCall.args?.nama;

          const result = await pool.query(
            `
            SELECT
              id,
              nama,
              tipe,
              deskripsi_lokasi
            FROM locations
            WHERE nama ILIKE $1
            ORDER BY id
            LIMIT 1;
            `,
            [`%${nama}%`]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message: "Lokasi tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL FIND SERVICE ========================== */
        /* ================================================== */

        else if (functionCall.name === "find_service") {

          const nama =
            functionCall.args?.nama;

          const result = await pool.query(
            `
            SELECT
              id,
              nama,
              kategori,
              deskripsi,
              persyaratan,
              lokasi,
              jam_layanan,
              estimasi_proses
            FROM services
            WHERE nama ILIKE $1
            ORDER BY id
            LIMIT 1;
            `,
            [`%${nama}%`]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message: "Layanan tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL FIND ROOM ============================= */
        /* ================================================== */

        else if (functionCall.name === "find_room") {

          const nama =
            functionCall.args?.nama;

          const result = await pool.query(
            `
            SELECT
              rooms.id,
              rooms.nama AS nama_ruangan,
              rooms.lantai,
              buildings.nama AS nama_gedung
            FROM rooms
            JOIN buildings
              ON rooms.building_id = buildings.id
            WHERE rooms.nama ILIKE $1
            ORDER BY rooms.id
            LIMIT 1;
            `,
            [`%${nama}%`]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message: "Ruangan tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL CHECK KRS STATUS ====================== */
        /* ================================================== */

        else if (functionCall.name === "check_krs_status") {

          const nim =
            functionCall.args?.nim;

          const result = await pool.query(
            `
            SELECT
              students.nim,
              students.nama,
              krs.status AS status_krs
            FROM students
            JOIN krs
              ON students.id = krs.student_id
            WHERE students.nim = $1
            LIMIT 1;
            `,
            [nim]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message:
                "Data KRS mahasiswa tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL GET ADVISOR =========================== */
        /* ================================================== */

        else if (functionCall.name === "get_advisor") {

          const nim =
            functionCall.args?.nim;

          const result = await pool.query(
            `
            SELECT
              students.nim,
              students.nama AS nama_mahasiswa,
              lecturers.nama AS dosen_wali
            FROM students
            JOIN lecturers
              ON students.dosen_wali_id = lecturers.id
            WHERE students.nim = $1
            LIMIT 1;
            `,
            [nim]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message:
                "Data dosen wali mahasiswa tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL GET STUDENT INFO ====================== */
        /* ================================================== */

        else if (functionCall.name === "get_student_info") {

          const nim =
            functionCall.args?.nim;

          const result = await pool.query(
            `
            SELECT
              s.id,
              s.nim,
              s.nama,
              s.prodi,
              s.semester,
              l.nama AS dosen_wali
            FROM students s
            LEFT JOIN lecturers l
              ON s.dosen_wali_id = l.id
            WHERE s.nim = $1;
            `,
            [nim]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              data: result.rows[0],
            };

          } else {

            toolResult = {
              success: false,
              message:
                "Mahasiswa dengan NIM tersebut tidak ditemukan.",
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL GET SCHEDULE ========================== */
        /* ================================================== */

        else if (functionCall.name === "get_schedule") {

          const hari =
            functionCall.args?.hari;

          const result = await pool.query(
            `
            SELECT
              schedules.id,
              schedules.nama_kegiatan,
              rooms.nama AS ruangan,
              schedules.hari,
              schedules.mulai,
              schedules.selesai
            FROM schedules
            JOIN rooms
              ON schedules.room_id = rooms.id
            WHERE LOWER(schedules.hari) = LOWER($1)
            ORDER BY schedules.mulai ASC;
            `,
            [hari]
          );


          if (result.rows.length > 0) {

            toolResult = {
              success: true,
              hari: hari,
              jumlah: result.rows.length,
              data: result.rows,
            };

          } else {

            toolResult = {
              success: false,
              message:
                `Tidak ada jadwal pada hari ${hari}.`,
              data: [],
            };

          }
        }


        /* ================================================== */
        /* ===== TOOL GET ROOM STATUS ======================= */
        /* ================================================== */

        else if (functionCall.name === "get_room_status") {

          const room =
            functionCall.args?.room;

          const hari =
            functionCall.args?.hari;

          const jam =
            functionCall.args?.jam;


          const roomResult = await pool.query(
            `
            SELECT
              id,
              nama,
              lantai,
              building_id
            FROM rooms
            WHERE nama ILIKE $1
            ORDER BY id
            LIMIT 1;
            `,
            [`%${room}%`]
          );


          if (roomResult.rows.length === 0) {

            toolResult = {
              success: false,
              message: "Ruangan tidak ditemukan.",
            };

          } else {

            const roomData =
              roomResult.rows[0];


            const scheduleResult =
              await pool.query(
                `
                SELECT
                  schedules.id,
                  schedules.nama_kegiatan,
                  schedules.hari,
                  schedules.mulai,
                  schedules.selesai
                FROM schedules
                WHERE schedules.room_id = $1
                  AND LOWER(schedules.hari) = LOWER($2)
                  AND $3::time >= schedules.mulai
                  AND $3::time < schedules.selesai
                ORDER BY schedules.mulai ASC
                LIMIT 1;
                `,
                [
                  roomData.id,
                  hari,
                  jam,
                ]
              );


            if (scheduleResult.rows.length > 0) {

              toolResult = {
                success: true,
                status: "digunakan",
                ruangan: roomData,
                jadwal: scheduleResult.rows[0],
              };

            } else {

              toolResult = {
                success: true,
                status: "kosong",
                ruangan: roomData,
                jadwal: null,
              };

            }
          }
        }


      /* ================================================== */
/* ===== TOOL CREATE LETTER ========================= */
/* ================================================== */

else if (functionCall.name === "create_letter") {

  const nim =
    functionCall.args?.nim;

  const jenis_surat =
    functionCall.args?.jenis_surat;

  const alasan =
    functionCall.args?.alasan;

  const isi_surat =
    functionCall.args?.isi_surat;

  const konfirmasi =
    functionCall.args?.konfirmasi;


  /* ===== CEK KONFIRMASI ===== */

  if (konfirmasi !== true || confirmed !== true) {

    /* ===== BELUM ADA KONFIRMASI ===== */

    console.log(
      "Create letter ditolak karena belum ada konfirmasi."
    );

    return {
      text: `
Saya sudah menyiapkan draft surat berikut:

**Jenis Surat:** ${jenis_surat}

**Alasan:** ${alasan}

**NIM:** ${nim}

**Isi Surat:**

${isi_surat}

Draft surat ini **belum disimpan ke database**.

Apakah Anda ingin menyimpan draft surat ini?
      `.trim(),

      preview: true,

      pendingLetter: {
        nim,
        jenis_surat,
        alasan,
        isi_surat,
      },
    };

  } else {

    /* ===== CARI DATA MAHASISWA ===== */

    const studentResult =
      await pool.query(
        `
        SELECT
          students.id,
          students.nim,
          students.nama,
          students.prodi,
          students.semester,
          students.dosen_wali_id,
          lecturers.nama AS dosen_wali
        FROM students
        LEFT JOIN lecturers
          ON students.dosen_wali_id = lecturers.id
        WHERE students.nim = $1
        LIMIT 1;
        `,
        [nim]
      );


    /* ===== MAHASISWA TIDAK DITEMUKAN ===== */

    if (studentResult.rows.length === 0) {

      toolResult = {
        success: false,
        message:
          "Mahasiswa dengan NIM tersebut tidak ditemukan.",
      };

    } else {

      const student =
        studentResult.rows[0];


      /* ===== SIMPAN DRAFT SURAT ===== */

      const letterResult =
        await pool.query(
          `
          INSERT INTO letter_requests (
            student_id,
            dosen_wali_id,
            jenis_surat,
            alasan,
            isi_surat,
            status
          )
          VALUES ($1, $2, $3, $4, $5, 'draft')
          RETURNING
            id,
            jenis_surat,
            alasan,
            isi_surat,
            status,
            created_at;
          `,
          [
            student.id,
            student.dosen_wali_id,
            jenis_surat,
            alasan,
            isi_surat,
          ]
        );


      toolResult = {

        success: true,

        message:
          "Draft surat berhasil dibuat.",

        data: {

          surat:
            letterResult.rows[0],

          mahasiswa: {
            nim: student.nim,
            nama: student.nama,
            prodi: student.prodi,
            semester: student.semester,
          },

          dosen_wali:
            student.dosen_wali,
        },
      };
    }
  }
}

        /* ================================================== */
        /* ===== TOOL TIDAK DIKENAL ========================= */
        /* ================================================== */

        else {

          toolResult = {
            success: false,
            message:
              `Tool ${functionCall.name} tidak dikenali.`,
          };

          console.error(
            "Tool tidak dikenali:",
            functionCall.name
          );
        }


        /* ================================================== */
        /* ===== KIRIM HASIL TOOL KEMBALI KE GEMINI ========= */
        /* ================================================== */
        toolResultsHistory.push({
        tool: functionCall.name,
        result: toolResult,
      });


        response = await ai.models.generateContent({

          model: "gemini-3.5-flash-lite",

          config: {
            systemInstruction: `
Kamu adalah Campus Guide Copilot.

Gunakan hasil tool sebagai sumber informasi utama.

Jangan mengarang informasi yang tidak diberikan oleh tool.

Jika tujuan mahasiswa masih membutuhkan tool lain,
gunakan tool yang sesuai.

Jika semua informasi sudah cukup,
berikan jawaban akhir kepada mahasiswa.

Untuk pembuatan surat:
- Jelaskan bahwa draft surat sudah dibuat.
- Tampilkan jenis surat.
- Tampilkan alasan.
- Tampilkan isi surat.
- Tampilkan nama mahasiswa.
- Tampilkan NIM.
- Tampilkan program studi.
- Tampilkan semester.
- Tampilkan dosen wali.
- Jelaskan bahwa status surat adalah DRAFT.
- Jangan mengatakan surat sudah dikirim.
- Jangan mengatakan surat sudah disetujui.

Jawab dengan bahasa Indonesia yang jelas dan ramah.
`,

            tools: [
              findLocationTool,
              findServiceTool,
              findRoomTool,
              checkKrsStatusTool,
              getAdvisorTool,
              getStudentInfoTool,
              getScheduleTool,
              getRoomStatusTool,
              createLetterTool,
            ],
          },

          contents: [

              /* ===== PESAN USER ASLI ===== */

              {
                role: "user",
                parts: [
                  {
                    text: message,
                  },
                ],
              },

              /* ===== HASIL TOOL YANG SUDAH DIJALANKAN ===== */

              ...toolResultsHistory.map((item) => ({
                role: "user",
                parts: [
                  {
                    text: `Hasil tool ${item.tool}:\n${JSON.stringify(item.result)}`,
                  },
                ],
              })),

              /* ===== RESPONSE GEMINI SEBELUM TOOL ===== */

              response.candidates[0].content,

              /* ===== HASIL TOOL TERBARU ===== */

              {
                role: "user",
                parts: [
                  {
                    functionResponse: {
                      id: functionCall.id,
                      name: functionCall.name,
                      response: toolResult,
                    },
                  },
                ],
              },

            ],
        });

      }


      /* ===== BATAS MAKSIMAL TOOL STEP ===== */

      console.log(
        "Gemini mencapai batas maksimal tool step."
      );

      return response;

    } catch (error) {

      const status = error.status;

      console.error(
        `Gemini attempt ${attempt + 1} gagal. Status: ${status}`
      );


      /* ===== CEK APAKAH ERROR BISA DI-RETRY ===== */

      const isRetryable =
        status === 408 ||
        status === 429 ||
        status >= 500;


      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }


      /* ===== EXPONENTIAL BACKOFF ===== */

      const delay =
        1000 * Math.pow(2, attempt);


      console.log(
        `Retry dalam ${delay / 1000} detik...`
      );


      await sleep(delay);
    }
  }
}

/* ===== API CHAT ===== */

export async function POST(request) {
  try {
    const body = await request.json();

    const message = body.message;

    const messages =
  Array.isArray(body.messages)
    ? body.messages
    : [];
    
    const nim = body.nim || null;

    const confirmed =
      body.confirmed === true;

    const pendingLetter =
      body.pendingLetter || null;


    const response = await generateWithRetry(
  message,
  messages,
  nim,
  3,
  confirmed,
  pendingLetter
);


    return Response.json({
      reply: response.text,
      preview: response.preview || false,
      pendingLetter:
        response.pendingLetter || null,
    });


  } catch (error) {

    console.error("Gemini Error:", error);


    return Response.json(
      {
        reply:
          "Maaf, terjadi kesalahan saat menghubungi AI.",
      },
      {
        status: 500,
      }
    );
  }
}
