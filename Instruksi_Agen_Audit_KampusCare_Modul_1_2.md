# Instruksi Agen — Audit dan Penyederhanaan Kode KampusCare (Modul 1–2)

## Tujuan

Audit repository KampusCare yang sedang dikerjakan. Periksa apakah kode dan struktur file benar-benar diperlukan, apakah implementasinya sesuai dengan materi Modul 1 dan Modul 2, serta apakah ada kode yang terlalu rumit atau melampaui materi praktikum.

**Prioritas utama: sederhana, mudah dipahami mahasiswa, sesuai modul, dan tetap berfungsi.** Jangan menambah fitur atau membuat arsitektur lebih canggih hanya karena bisa.

## Konteks proyek

- Proyek: KampusCare.
- Teknologi yang diketahui: React Native, TypeScript, Expo, Expo Router.
- Modul 1 membahas dasar TypeScript dan UI React Native, termasuk type/interface, array of objects, function, loop/map, komponen UI dasar, serta styling.
- Modul 2 membahas state dan hooks, termasuk `useState` dan `useEffect`, struktur route Expo Router, `_layout.tsx`, `<Stack.Screen>`, serta navigasi seperti `router.push()`, `router.back()`, dan fungsi lain yang dibahas dalam modul.
- Struktur yang pernah digunakan mencakup `src/app`, `src/components`, `src/data`, dan `src/styles`. **Ini hanya petunjuk awal, bukan asumsi mutlak. Periksa struktur repository aktual sebelum mengambil keputusan.**
- Aplikasi dan pekerjaan Modul 1 harus tetap berfungsi setelah audit.

Jika PDF Modul 1 dan Modul 2 tersedia di workspace/repository atau dilampirkan pada percakapan, gunakan dokumen tersebut sebagai sumber utama untuk menentukan materi yang diajarkan. Jangan mengklaim suatu teknik berasal dari modul jika tidak dapat diverifikasi dari sumber.

## Aturan kerja wajib

1. **Mulai dengan pemeriksaan saja. Jangan mengubah atau menghapus file sebelum audit awal dan rencana perbaikan dilaporkan.**
2. Jangan langsung menulis ulang proyek dari awal.
3. Jangan menambah fitur baru, dependency, library UI, state-management library, backend, database, API, atau abstraksi yang tidak diperlukan.
4. Jangan melakukan refactor besar hanya untuk preferensi gaya pribadi.
5. Pertahankan desain dan fungsi KampusCare yang sudah berjalan, kecuali ada masalah yang jelas dan teridentifikasi.
6. Jangan menghapus file hanya karena tidak di-import secara langsung. Periksa kemungkinan file tersebut merupakan route Expo Router, layout, konfigurasi, aset, atau entry point.
7. Jangan menghapus atau mengubah `package.json`, lockfile, konfigurasi Expo, konfigurasi TypeScript, route, atau aset sebelum menjelaskan dampak dan memverifikasi bahwa perubahan aman.
8. Jangan mengasumsikan nama file, nama properti data, tipe ID, atau nama route. Baca kode aktual terlebih dahulu.
9. Jangan menampilkan isi file rahasia. Jangan menampilkan token, password, atau kredensial.
10. Jangan menyatakan aplikasi sudah lolos pengujian jika perintah pengujian belum benar-benar dijalankan dan hasilnya belum diperiksa.
11. Jika ada hal yang tidak bisa diverifikasi, tandai sebagai **Belum terverifikasi** dan jelaskan bukti apa yang dibutuhkan.
12. Hindari teknik di luar materi jika solusi sederhana yang sesuai modul sudah memadai. Jika teknik di luar modul memang diperlukan untuk menjaga aplikasi berfungsi, tandai sebagai **Di luar materi modul** dan jelaskan alasannya.

## Tahap 1 — Inventarisasi repository

Periksa dan laporkan:

- Struktur folder dan file penting.
- Framework, scripts, serta dependencies yang benar-benar tercantum dalam `package.json`.
- File route Expo Router dan layout yang aktif.
- File komponen, data, styles, hooks, utilitas, aset, serta konfigurasi.
- File yang tampak duplikat, kosong, tidak direferensikan, atau mungkin merupakan sisa percobaan.
- Import yang tidak digunakan dan kode yang tampak tidak pernah dipanggil.
- Error atau warning yang sudah terlihat dari pemeriksaan yang aman.

Jangan menampilkan isi file rahasia. Jangan menganggap hasil pencarian teks saja cukup untuk menyimpulkan bahwa file tidak dipakai.

## Tahap 2 — Audit kesesuaian Modul 1 dan Modul 2

Buat tabel per file atau kelompok file dengan kolom:

| File/Bagian | Fungsi aktual | Kesesuaian materi | Bukti dari kode/modul | Masalah | Rekomendasi |
|---|---|---|---|---|---|

Gunakan label berikut:

- **Sesuai Modul 1**
- **Sesuai Modul 2**
- **Di luar materi modul**
- **Tidak diperlukan/duplikat — perlu verifikasi**
- **Berpotensi error**
- **Belum terverifikasi**

Periksa khususnya:

### Modul 1
- Penggunaan TypeScript dan type/interface.
- Array of objects.
- Function dan loop/map.
- Komponen React Native dasar yang dipakai.
- Styling internal, inline, atau external sesuai materi.
- Apakah ada struktur atau library tambahan yang sebenarnya tidak dibutuhkan.

### Modul 2
- Tujuan dan penggunaan `useState`.
- Tujuan dan dependency `useEffect`, termasuk kemungkinan effect yang tidak diperlukan atau loop state.
- File route dan aturan penamaan Expo Router.
- Fungsi `_layout.tsx`, `<Stack>`, dan `<Stack.Screen>`.
- Pemakaian `router.push()`, `router.back()`, serta fungsi router tambahan yang digunakan.
- Konsistensi nama route dan cara pengiriman/pembacaan parameter.
- Apakah fitur yang dinilai benar-benar berfungsi, bukan sekadar menuliskan pemanggilan fungsi.

Gunakan PDF modul yang tersedia sebagai acuan. Pisahkan fakta yang didukung modul dari rekomendasi teknis tambahan.

## Tahap 3 — Evaluasi file dan kode yang mungkin tidak digunakan

Untuk setiap kandidat file atau kode yang akan dihapus, jelaskan:

1. Apa fungsi file/kode tersebut.
2. Bukti bahwa file/kode tidak digunakan.
3. Apakah Expo Router, konfigurasi, atau mekanisme lain mungkin tetap memerlukannya.
4. Dampak penghapusan.
5. Cara verifikasi setelah perubahan.

Jangan menghapus file yang statusnya belum pasti. Tandai untuk pemeriksaan manual.

## Tahap 4 — Rencana penyederhanaan

Setelah audit, buat daftar perubahan dengan prioritas:

- **P0 — Wajib:** error, fitur rubrik yang tidak berfungsi, route rusak, atau masalah yang menghambat aplikasi.
- **P1 — Disarankan:** kode duplikat/tidak digunakan yang sudah terverifikasi, import tak terpakai, atau implementasi terlalu rumit yang bisa disederhanakan.
- **P2 — Opsional:** perubahan kosmetik yang tidak berdampak pada rubrik atau pemahaman kode.

Untuk setiap perubahan, tulis:
- File yang terdampak.
- Masalah saat ini.
- Bentuk solusi yang paling sederhana.
- Materi modul yang menjadi dasar.
- Risiko dan tes yang diperlukan.

**Berhenti setelah menyampaikan hasil audit dan rencana. Jangan melakukan perubahan file pada tahap ini.** Tunggu persetujuan pengguna sebelum menerapkan rencana.

## Tahap 5 — Setelah rencana disetujui

Jika pengguna menyetujui perubahan:

1. Terapkan perubahan sekecil mungkin dan satu kelompok perubahan pada satu waktu.
2. Jangan mengubah bagian yang tidak berkaitan dengan masalah.
3. Jangan menghapus file yang belum terverifikasi.
4. Pertahankan seluruh fitur wajib Modul 1 dan Modul 2.
5. Setelah setiap kelompok perubahan, periksa diff dan pastikan tidak ada perubahan tak sengaja.
6. Jalankan pemeriksaan yang tersedia, misalnya TypeScript check, lint, atau Expo start, sesuai scripts yang benar-benar ada di proyek. Jangan mengarang nama script.
7. Jika memungkinkan, uji manual alur utama aplikasi.
8. Jika pengujian gagal, jelaskan hasil aktual dan perbaiki hanya jika penyebabnya jelas. Jangan menyatakan berhasil jika belum.
9. Jangan melakukan commit, push, merge, atau mengubah branch tanpa instruksi eksplisit dari pengguna.

## Kriteria selesai

Audit dianggap selesai apabila:

- Setiap file penting telah diklasifikasikan dan fungsi utamanya dijelaskan.
- Kandidat file tidak terpakai sudah diberi bukti dan status kepastian.
- Kode sudah dibandingkan dengan Modul 1 dan Modul 2 sejauh sumber tersedia.
- Kode/fitur di luar modul telah ditandai secara transparan.
- Ada rencana perubahan yang diprioritaskan dan dapat disetujui pengguna.
- Tidak ada file yang dihapus atau diubah sebelum rencana disetujui.

Jika perubahan sudah disetujui dan diterapkan, laporan akhir harus mencantumkan file yang berubah, alasan setiap perubahan, hasil tes aktual, hal yang belum terverifikasi, serta cara menjalankan aplikasi.

## Gaya laporan

Gunakan bahasa Indonesia yang ringkas, jelas, dan langsung. Jangan hanya mengatakan “kode bagus” atau “sudah sesuai”. Berikan bukti konkret dari file dan, jika tersedia, halaman/istilah modul yang relevan. Prioritaskan kode yang bisa dipahami dan dijelaskan saat dosen meminta live modification.
