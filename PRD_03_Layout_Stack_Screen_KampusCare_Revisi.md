# PRD 03 --- Layout dan Stack Screen Expo Router KampusCare

  Item        Keterangan
  ----------- -----------------------------------------------------
  Proyek      KampusCare
  Teknologi   React Native, TypeScript, Expo Router
  Kriteria    Menerapkan `_layout.tsx` dan `<Stack.Screen>` (10%)
  Pemilik     Anggota C
  Status      Revisi untuk implementasi

## 1. Tujuan

Mengatur halaman KampusCare menggunakan Expo Router Stack, mendaftarkan
route dengan `<Stack.Screen>`, dan menetapkan judul header yang
konsisten.

## 2. Ruang Lingkup

**Termasuk** - Memeriksa dan memperbarui `_layout.tsx` yang sudah ada. -
Menggunakan `<Stack>` dan `<Stack.Screen>`. - Mendaftarkan halaman
Beranda, Detail Ruangan, dan Laporan Kerusakan. - Menentukan judul
header untuk setiap halaman. - Menyepakati nama route dengan Anggota B.

**Tidak termasuk** - Logika pencarian dan hook (PRD 01). - Handler
navigasi dan isi fungsional halaman detail/laporan (PRD 02). - Tab,
drawer, modal kompleks, animasi khusus, backend, dan library tambahan.

## 3. User Story

Sebagai pengguna, saya ingin setiap halaman memiliki judul yang jelas
dan header yang konsisten agar saya memahami posisi saya di aplikasi.

## 4. Struktur Route yang Disepakati

**\[VERIFIKASI\]** Pastikan struktur aktual repository. Berdasarkan
struktur KampusCare yang telah digunakan, file berada di `src/app`:

``` text
src/app/
├── _layout.tsx
├── index.tsx
├── detail-ruangan.tsx
└── laporan-kerusakan.tsx
```

  Nama file                 Route                  Judul
  ------------------------- ---------------------- -------------------
  `index.tsx`               `/`                    KampusCare
  `detail-ruangan.tsx`      `/detail-ruangan`      Detail Ruangan
  `laporan-kerusakan.tsx`   `/laporan-kerusakan`   Laporan Kerusakan

Nama route di tabel ini harus sama dengan yang digunakan pada PRD 02.
Jika repository memiliki nama berbeda, sepakati dan perbarui kedua PRD
sebelum implementasi.

## 5. Kebutuhan Fungsional

  -----------------------------------------------------------------------
  ID                                  Kebutuhan
  ----------------------------------- -----------------------------------
  FR-3.1                              `src/app/_layout.tsx` mengekspor
                                      komponen layout secara default.

  FR-3.2                              Layout merender `<Stack>`.

  FR-3.3                              `index`, `detail-ruangan`, dan
                                      `laporan-kerusakan` didaftarkan
                                      menggunakan `<Stack.Screen>`.

  FR-3.4                              Judul setiap halaman sesuai tabel
                                      route.

  FR-3.5                              Opsi header bersama ditetapkan pada
                                      `screenOptions` jika diperlukan.

  FR-3.6                              Tombol kembali bawaan Stack
                                      tersedia pada halaman yang memiliki
                                      riwayat navigasi.

  FR-3.7                              Tidak ada nama `Stack.Screen` yang
                                      merujuk ke file yang tidak ada.
  -----------------------------------------------------------------------

## 6. Aturan Teknis

-   Periksa `_layout.tsx` saat ini terlebih dahulu. **Jangan mengganti
    atau menghapus konfigurasi yang sudah berfungsi tanpa alasan.**
-   Gunakan pola `Stack` dan `Stack.Screen` sesuai contoh Modul 2.
-   Nilai `name` harus sesuai dengan nama file route tanpa ekstensi.
-   Gunakan judul yang mudah dipahami: `KampusCare`, `Detail Ruangan`,
    dan `Laporan Kerusakan`.
-   Styling header merupakan penyempurnaan opsional; prioritaskan
    persyaratan rubrik dan pertahankan tema yang sudah ada.
-   Jangan menaruh data atau komponen utilitas non-route di dalam folder
    `src/app`.
-   Anggota C mengelola `_layout.tsx`. Anggota lain tidak mengubah file
    ini tanpa koordinasi.

## 7. Acceptance Criteria

-   [x] `_layout.tsx` yang aktif berada pada lokasi yang benar dan dapat
    dijalankan.
-   [x] Layout menggunakan `<Stack>`.
-   [x] Tiga halaman terdaftar dengan `<Stack.Screen>`.
-   [x] Judul setiap halaman sesuai tabel.
-   [x] Nama route sama dengan nama file dan konsisten dengan PRD 02.
-   [x] Tidak muncul peringatan route yang tidak ditemukan.
-   [x] Tidak ada library tambahan yang diperlukan.

## 8. Skenario Pengujian

  -----------------------------------------------------------------------
  Skenario                Langkah                 Hasil yang diharapkan
  ----------------------- ----------------------- -----------------------
  Beranda                 Jalankan aplikasi       Beranda tampil dengan
                                                  judul KampusCare

  Detail                  Navigasi ke Detail      Judul Detail Ruangan
                          Ruangan                 tampil

  Laporan                 Navigasi ke Laporan     Judul Laporan Kerusakan
                          Kerusakan               tampil

  Tombol kembali          Buka halaman detail     Header menampilkan
                          melalui navigasi        kontrol kembali sesuai
                                                  riwayat stack

  Validasi route          Jalankan aplikasi dan   Tidak ada peringatan
                          periksa log             route yang tidak
                                                  ditemukan
  -----------------------------------------------------------------------

## 9. Definition of Done

-   [x] Semua acceptance criteria lulus.
-   [x] Layout tidak merusak UI Beranda Modul 1.
-   [x] Ketiga route terdaftar dan dapat diakses.
-   [x] Anggota C dapat menjelaskan fungsi `_layout.tsx`, `Stack`, dan
    `Stack.Screen`.
-   [x] Perubahan dibuat dalam commit Git milik Anggota C.

## 10. Dependensi dan Integrasi

-   PRD 03 menetapkan nama route lebih dahulu dan memberi tahu Anggota A
    serta B.
-   PRD 02 membuat halaman Detail Ruangan dan Laporan Kerusakan dengan
    nama file yang disepakati.
-   PRD 01 mempertahankan halaman Beranda di `index.tsx`.
-   Semua anggota harus menjalankan aplikasi setelah penggabungan untuk
    memastikan route dan UI tetap berfungsi.

## 11. Penyempurnaan Tampilan Antarmuka (UI/UX)

### 11.1 Tujuan

Meningkatkan kualitas tampilan aplikasi KampusCare agar lebih rapi, modern, profesional, dan nyaman digunakan tanpa mengubah kebutuhan fungsional maupun kriteria penilaian pada PRD 03.

### 11.2 Ruang Lingkup

**Termasuk**
- Penyempurnaan hierarki visual, tipografi, warna, dan spacing.
- Penyempurnaan tampilan tombol aksi dan kartu informasi.
- Penyempurnaan tampilan kartu ruangan dan ringkasan status.
- Konsistensi desain halaman Beranda, Detail Ruangan, dan Laporan Kerusakan.
- Penyesuaian tampilan agar tetap nyaman pada ukuran layar yang berbeda.

**Tidak termasuk**
- Perubahan logika pencarian dan hook (PRD 01).
- Perubahan handler navigasi dan logika fungsional halaman (PRD 02).
- Perubahan struktur route dan mekanisme navigasi yang telah ditetapkan pada PRD 03.
- Penambahan fitur baru, backend, animasi khusus, atau library tambahan yang tidak diperlukan.

### 11.3 Kebutuhan Desain

| ID | Kebutuhan |
|---|---|
| UI-3.1 | Tampilan aplikasi menggunakan gaya visual modern, bersih, dan profesional dengan biru sebagai warna identitas utama KampusCare. |
| UI-3.2 | Hierarki judul, subjudul, label, angka, dan teks pendukung dibuat jelas dan konsisten. |
| UI-3.3 | Spacing, padding, margin, dan perataan komponen diatur agar tampilan seimbang dan mudah dibaca. |
| UI-3.4 | Tombol Lapor Kerusakan dan Lihat Laporan memiliki ukuran dan hierarki visual yang proporsional tanpa mengubah fungsi navigasinya. |
| UI-3.5 | Kartu ruangan menampilkan nomor ruang, gedung, kapasitas, dan status dengan susunan informasi yang terstruktur. |
| UI-3.6 | Status Kosong, Terpakai, Akan Datang, dan Perbaikan memiliki pembeda visual yang konsisten dan mudah dipahami. |
| UI-3.7 | Ringkasan Status Ruang Kelas menampilkan angka dan label secara jelas berdasarkan data yang sudah tersedia. |
| UI-3.8 | Kolom pencarian memiliki tampilan yang selaras dengan komponen lainnya tanpa mengubah mekanisme pencarian. |
| UI-3.9 | Halaman Detail Ruangan dan Laporan Kerusakan menggunakan gaya visual yang konsisten dengan Beranda. |
| UI-3.10 | Seluruh konten dan fungsi Beranda Modul 1 tetap dipertahankan. |
| UI-3.11 | Penyempurnaan UI tidak mengganggu implementasi `<Stack>`, `<Stack.Screen>`, judul header, dan navigasi Expo Router. |
| UI-3.12 | Tidak ada data dekoratif atau angka statis baru yang menggantikan data dan mekanisme yang sudah tersedia. |

### 11.4 Aturan Teknis

- Periksa implementasi dan styling yang sudah ada sebelum melakukan perubahan.
- Gunakan komponen React Native dan TypeScript sesuai teknologi proyek.
- Pertahankan struktur repository serta konfigurasi yang sudah berfungsi.
- Lakukan perubahan pada file yang relevan dengan tampilan halaman. Perubahan tidak harus terbatas pada `_layout.tsx`.
- Gunakan komponen dan dependensi yang sudah tersedia apabila mencukupi.
- Jangan mengubah nama route tanpa verifikasi dan koordinasi dengan PRD 02.
- Jangan menghapus konten, fungsi, atau komponen yang masih digunakan.
- Jika terjadi konflik antara penyempurnaan visual dan persyaratan fungsional, persyaratan PRD 01, PRD 02, dan PRD 03 tetap diutamakan.

### 11.5 Acceptance Criteria

- [x] Tampilan KampusCare lebih rapi, modern, dan tidak monoton dibandingkan kondisi awal.
- [x] Hierarki visual, tipografi, warna, dan spacing konsisten.
- [x] Tombol aksi, kartu ruangan, dan ringkasan status lebih mudah dipahami.
- [x] Tampilan Beranda, Detail Ruangan, dan Laporan Kerusakan selaras.
- [x] Fungsi dan konten yang sudah tersedia tetap berjalan.
- [x] Tidak ada perubahan yang melanggar ruang lingkup PRD 01, PRD 02, maupun PRD 03.
- [x] Seluruh acceptance criteria pada Bagian 7 tetap terpenuhi.

### 11.6 Definition of Done

- [x] Penyempurnaan UI telah diterapkan langsung pada kode proyek.
- [x] Tampilan halaman telah diperiksa terhadap kebutuhan desain pada Bagian 11.3.
- [x] Fungsi dan navigasi yang sudah tersedia tetap dipertahankan.
- [x] Tidak terdapat error baru akibat perubahan UI berdasarkan pemeriksaan yang dilakukan.
- [x] Implementasi tetap memenuhi kebutuhan dan rubrik PRD 03.

### 11.7 Dependensi dan Integrasi

- PRD 03 tetap menjadi acuan utama implementasi layout dan navigasi Expo Router Stack.
- Penyempurnaan UI dilakukan pada komponen dan halaman yang relevan tanpa mengambil alih ruang lingkup PRD 01 dan PRD 02.
- Integrasi akhir harus diperiksa untuk memastikan tampilan, route, header, dan fungsi aplikasi tetap berjalan sesuai kebutuhan.

