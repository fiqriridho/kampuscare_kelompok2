# PRD 02 --- Navigasi Expo Router KampusCare

  -----------------------------------------------------------------------
  Item                                Keterangan
  ----------------------------------- -----------------------------------
  Proyek                              KampusCare

  Teknologi                           React Native, TypeScript, Expo
                                      Router

  Kriteria                            Menerapkan `push()`, `back()`, dan
                                      satu fungsi Expo Router lainnya
                                      (10%)

  Pemilik                             Anggota B

  Status                              Revisi untuk implementasi
  -----------------------------------------------------------------------

## 1. Tujuan

Membuat alur navigasi yang dapat diuji dari Beranda ke Detail Ruangan,
kemudian ke Laporan Kerusakan. Implementasi harus menunjukkan
`router.push()`, `router.back()`, dan `router.replace()` dalam interaksi
nyata.

## 2. Ruang Lingkup

**Termasuk** - Beranda ke Detail Ruangan menggunakan `router.push()`. -
Detail Ruangan ke Laporan Kerusakan menggunakan `router.push()`. -
Tombol kembali/batal menggunakan `router.back()`. - Tombol selesai pada
simulasi laporan menggunakan `router.replace('/')`. - Pengiriman ID
ruangan sebagai parameter route dan penanganan ID yang tidak ditemukan.

**Tidak termasuk** - Backend atau penyimpanan laporan permanen. - Login,
autentikasi, database, API, tab, drawer, dan library tambahan. -
Implementasi pencarian/hooks (PRD 01) atau konfigurasi layout (PRD 03).

## 3. User Story

Sebagai mahasiswa, saya ingin membuka detail ruangan, menuju halaman
laporan kerusakan, dan kembali ke halaman yang sesuai melalui tombol
navigasi yang jelas.

## 4. Alur Pengguna

1.  Beranda menampilkan daftar ruangan.
2.  Pengguna menekan salah satu ruangan → Detail Ruangan dibuka dengan
    `router.push()`.
3.  Detail Ruangan menampilkan informasi sesuai ID.
4.  Pengguna menekan "Laporkan Kerusakan" → halaman Laporan Kerusakan
    dibuka dengan `router.push()`.
5.  Tombol "Batal" memakai `router.back()` untuk kembali ke detail.
6.  Tombol "Kembali" di detail memakai `router.back()`.
7.  Tombol "Selesai" pada halaman laporan memakai `router.replace('/')`
    untuk kembali ke Beranda.

**Catatan:** Karena backend tidak termasuk ruang lingkup, "Selesai"
hanya menyimulasikan alur selesai; aplikasi tidak boleh mengklaim
laporan tersimpan secara permanen.

## 5. Kebutuhan Fungsional

  -----------------------------------------------------------------------
  ID                                  Kebutuhan
  ----------------------------------- -----------------------------------
  FR-2.1                              Menekan kartu ruangan membuka
                                      Detail Ruangan menggunakan
                                      `router.push()`.

  FR-2.2                              ID ruangan diteruskan sebagai
                                      parameter route.

  FR-2.3                              Detail menampilkan informasi
                                      ruangan yang sesuai dengan ID.

  FR-2.4                              Tombol "Laporkan Kerusakan" membuka
                                      halaman laporan dengan
                                      `router.push()`.

  FR-2.5                              Tombol "Kembali" dan "Batal"
                                      menggunakan `router.back()`.

  FR-2.6                              Tombol "Selesai" menggunakan
                                      `router.replace('/')`.

  FR-2.7                              ID yang hilang/tidak cocok
                                      ditangani dengan pesan yang jelas
                                      dan opsi kembali ke Beranda.

  FR-2.8                              Semua fungsi navigasi dipanggil
                                      melalui event handler, bukan saat
                                      render.
  -----------------------------------------------------------------------

## 6. Struktur File

**\[VERIFIKASI\]** Periksa struktur repository aktual sebelum membuat
file. Berdasarkan struktur KampusCare yang telah digunakan:

``` text
src/app/
├── _layout.tsx
├── index.tsx
├── detail-ruangan.tsx
└── laporan-kerusakan.tsx
```

-   `index.tsx`: Anggota A mengelola pencarian; Anggota B menambahkan
    handler navigasi pada kartu ruangan. Jangan saling menimpa
    perubahan.
-   `detail-ruangan.tsx`: Anggota B membuat halaman detail.
-   `laporan-kerusakan.tsx`: Anggota B membuat halaman laporan.
-   Data ruangan dibaca dari file aktual di `src/data/room.ts`; jangan
    mengubah bentuk data tanpa persetujuan kelompok.

## 7. Aturan Teknis

-   Gunakan API Expo Router yang diajarkan pada Modul 2.
-   `router.push()` menambahkan halaman baru ke stack; `router.back()`
    kembali ke halaman sebelumnya; `router.replace()` mengganti halaman
    aktif.
-   Pastikan nama route sesuai nama file dan dengan PRD 03.
-   **\[VERIFIKASI\]** Sesuaikan tipe parameter ID dengan data aktual.
    Parameter route umumnya dibaca sebagai string; konversi seperlunya
    sebelum mencari data.
-   Jangan menganggap laporan benar-benar tersimpan. Tidak ada backend
    dalam ruang lingkup ini.
-   Jangan menambahkan route lain selain yang disepakati tanpa
    persetujuan kelompok.

## 8. Acceptance Criteria

-   [ ] Menekan ruangan membuka halaman Detail Ruangan.
-   [ ] Detail menampilkan ruangan yang benar berdasarkan ID.
-   [ ] Tombol "Laporkan Kerusakan" membuka halaman laporan.
-   [ ] Tombol "Kembali" dan "Batal" menggunakan `router.back()`.
-   [ ] Tombol "Selesai" menggunakan `router.replace('/')`.
-   [ ] ID tidak valid tidak menyebabkan aplikasi crash.
-   [ ] Fungsi navigasi dijalankan hanya ketika tombol/kartu ditekan.
-   [ ] Tidak ada library navigasi tambahan.

## 9. Skenario Pengujian

  -----------------------------------------------------------------------
  Skenario                Langkah                 Hasil yang diharapkan
  ----------------------- ----------------------- -----------------------
  Beranda ke detail       Tekan salah satu        Detail ruangan yang
                          ruangan                 dipilih tampil

  Detail ke laporan       Tekan "Laporkan         Halaman laporan tampil
                          Kerusakan"              

  Batal laporan           Tekan "Batal"           Kembali ke detail

  Kembali dari detail     Tekan tombol kembali    Kembali ke halaman
                                                  sebelumnya

  Selesai                 Tekan "Selesai"         Beranda tampil dan
                                                  halaman laporan
                                                  digantikan

  ID tidak valid          Uji route dengan ID     Pesan tidak ditemukan
                          yang tidak cocok        tampil, aplikasi tetap
                                                  berjalan

  Integrasi pencarian     Cari ruangan lalu tekan Detail menampilkan
                          hasilnya                ruangan yang dipilih
  -----------------------------------------------------------------------

## 10. Definition of Done

-   [ ] Semua acceptance criteria lulus.
-   [ ] Alur Beranda → Detail → Laporan dapat diuji.
-   [ ] `push`, `back`, dan `replace` dapat dijelaskan saat demo.
-   [ ] Nama route sudah disepakati dengan Anggota C.
-   [ ] Integrasi dengan pencarian PRD 01 tidak menghapus kode salah
    satu anggota.
-   [ ] Perubahan dibuat dalam commit Git milik Anggota B.

## 11. Dependensi

-   PRD 03 menetapkan nama route dan mendaftarkan halaman melalui
    `Stack.Screen`.
-   PRD 01 menampilkan hasil pencarian; item hasil harus meneruskan ID
    item yang benar ke handler navigasi.
-   Anggota B bertanggung jawab atas halaman detail, halaman laporan,
    dan pemanggilan router. Perubahan layout dikoordinasikan dengan
    Anggota C.
