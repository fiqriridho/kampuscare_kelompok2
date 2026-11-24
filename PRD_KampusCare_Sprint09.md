---
title: "PRD – KampusCare Sprint 09: Push Notification"
date: "24 November 2026"
---

## Ringkasan & latar belakang

Sprint 09 menambahkan Push Notification ke KampusCare agar mahasiswa dan admin menerima kabar dari server tanpa harus membuka aplikasi. Fitur ini **ditambahkan** di atas KampusCare yang sudah ada; struktur dan isi proyek yang berjalan tidak diubah.

KampusCare adalah aplikasi Expo/React Native untuk melaporkan kerusakan fasilitas kampus dan melihat status ruang kelas. Mahasiswa membuat laporan (foto, deskripsi, lokasi GPS); admin memproses laporan dan mengunggah bukti perbaikan. Hari ini kabar baru, seperti perubahan status laporan, hanya terlihat jika pengguna membuka aplikasi dan menarik data.

Materi Week 11 (Mobile Programming) menjadi acuan teknis: arsitektur push notification, provider (Expo Push Service / FCM), push token, payload, permission, dan penanganan tap. Tiga task sprint: **Task 01** register perangkat, **Task 02** kirim notifikasi dari server, **Task 03** tangani respons notifikasi.

## Kondisi saat ini (baseline, tidak diubah)

Bagian ini merangkum KampusCare apa adanya dari `src.zip`. Semua yang tercantum tetap seperti semula.

| Area | Kondisi yang ada |
|---|---|
| Platform | Expo + expo-router; `app/index.tsx` memuat `App` |
| Navigasi | Tab berbasis state `activeTab` (`Home`, `Camera`, `Reports`, `Profile`) di `useAuth`, via `BottomNavigation` |
| Peran | `mahasiswa` (membuat laporan) dan `admin` (mengelola tugas perbaikan) |
| Autentikasi | Register/login/logout/`me` lewat REST; token Bearer di SecureStore (native); 401 ditangani `authHandler` |
| Laporan | `useReports`: daftar, filter status (menunggu → diproses → selesai), buat laporan multipart, `PATCH` status, foto bukti, riwayat |
| Ruang kelas | `useRooms`: status ruang dari `/api/rooms` dengan mode offline |
| Kamera & lokasi | `CameraScreen`: foto, GPS, geofence kampus, reverse geocoding |
| Jaringan | `apiClient` (timeout, Bearer, 401) dan `getApiBaseUrl()` (web / perangkat fisik / emulator) |
| Penyimpanan | SecureStore untuk token; AsyncStorage untuk profil dan riwayat (kunci di `constants/storage.js`) |

Endpoint yang sudah ada: `/api/health`, `/api/auth/{register,login,me,logout}`, `/api/rooms`, `/api/reports`, `/api/reports/:id`, `.../photo`, `.../evidence-photo`, `.../history`.

## Tujuan, non-tujuan, user stories

Sasaran: saat status laporan berubah atau laporan baru masuk, perangkat terkait menerima notifikasi, dan menekannya membuka layar KampusCare yang relevan.

**Tujuan**

1. Mendaftarkan perangkat dan menyimpan push token per akun di server (Task 01).
2. Mengirim notifikasi dari server ke perangkat yang tepat (Task 02).
3. Menangani tap notifikasi dan membawa pengguna ke layar tujuan (Task 03).

**Non-tujuan**

- Mengubah alur, layar, atau logika laporan/ruangan/autentikasi yang sudah ada.
- Penjadwalan, segmentasi, atau analitik notifikasi; notifikasi interaktif dengan tombol aksi.
- Pusat notifikasi (daftar riwayat notifikasi) di dalam aplikasi.

| # | Sebagai | Saya ingin | Agar |
|---|---|---|---|
| US-1 | Mahasiswa | diberi tahu saat status laporan saya menjadi Diproses atau Selesai | saya tahu perkembangan tanpa membuka aplikasi |
| US-2 | Admin | diberi tahu saat ada laporan kerusakan baru | saya bisa segera menanganinya |
| US-3 | Pengguna | diminta izin notifikasi dan bisa menolaknya | saya mengendalikan notifikasi yang masuk |
| US-4 | Pengguna | menekan notifikasi dan langsung ke layar terkait | saya tidak mencari sendiri |

## Kebutuhan fungsional

Tiga task berurutan: token harus ada sebelum server bisa mengirim, dan pengiriman harus ada sebelum respons bisa ditangani.

**Task 01 – Register Device for Notification**

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Pasang dan integrasikan `expo-notifications` | Wajib |
| FR-02 | Minta notification permission saat runtime setelah login berhasil; tangani granted dan denied | Wajib |
| FR-03 | Ambil Expo Push Token (`getExpoPushTokenAsync`) pada perangkat fisik | Wajib |
| FR-04 | Kirim token ke backend via `apiClient` (Bearer), terhubung ke akun dan peran pengguna | Wajib |
| FR-05 | Saat logout, hapus token perangkat dari server agar notifikasi tidak bocor ke akun lain | Wajib |
| FR-06 | Android Notification Channel: "Status Laporan" dan "Laporan Baru" | Disarankan |

**Task 02 – Send Push Notification to KampusCare**

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-07 | Server mengirim notifikasi lewat provider (Expo Push Service atau FCM) ke token yang tersimpan | Wajib |
| FR-08 | Pemicu 1: `PATCH /api/reports/:id` mengubah status → notifikasi ke mahasiswa pelapor | Wajib |
| FR-09 | Pemicu 2: `POST /api/reports` → notifikasi ke admin | Wajib |
| FR-10 | Notifikasi berisi `title`, `body`, dan `data` (`screen`, `id`) | Wajib |
| FR-11 | Notifikasi tampil saat aplikasi foreground, background, dan terminated | Wajib |
| FR-12 | Pengujian: kirim pesan uji dan pastikan diterima di perangkat | Wajib |

**Task 03 – Handle Notification Response**

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-13 | Listener untuk tap notifikasi (response listener), termasuk saat aplikasi dibuka dari kondisi terminated | Wajib |
| FR-14 | Baca `data.screen` dan `data.id` dari payload | Wajib |
| FR-15 | Arahkan ke tab yang sesuai (`Reports` atau `Home`) lewat `setActiveTab` yang sudah ada | Wajib |
| FR-16 | Jika pengguna belum login, tunda navigasi sampai sesi pulih lalu lanjutkan | Wajib |
| FR-17 | `screen` tidak dikenal → buka `Home`, tanpa crash | Wajib |

## Rancangan teknis

Prinsip: **hanya menambah**. Fitur baru berdiri di file baru dan terhubung ke kode lama lewat titik sambung kecil; layar, hook, dan komponen yang ada tidak ditulis ulang.

**Alur end-to-end**

1. Pengguna login → aplikasi meminta permission notifikasi.
2. Aplikasi mengambil Expo Push Token perangkat.
3. Aplikasi mengirim token ke server; server menyimpannya untuk akun itu.
4. Admin mengubah status laporan (atau mahasiswa membuat laporan) → server memutuskan penerima.
5. Server mengirim pesan ke Expo Push Service / FCM, yang meneruskannya ke perangkat.
6. Sistem operasi menampilkan notifikasi.
7. Pengguna menekan notifikasi → aplikasi membaca payload dan membuka layar tujuan.

**Payload** (kontrak server ↔ aplikasi):

```json
{
  "title": "Status Laporan Diperbarui",
  "body": "Laporan \"AC Mati & Bising\" kini berstatus Diproses.",
  "data": { "screen": "Reports", "id": "12" }
}
```

**Tambahan baru (tidak mengubah yang lama)**

| Jenis | Item | Catatan |
|---|---|---|
| File baru | `src/hooks/useNotifications.js` | Permission, ambil token, listener tap |
| File baru | `src/services/notificationService.js` | Kirim/hapus token ke server |
| Konstanta | Entri baru di `API_ENDPOINTS`, mis. `PUSH_TOKEN: '/api/push/token'` | Hanya menambah kunci |
| Endpoint server baru | `POST /api/push/token`, `DELETE /api/push/token` | Usulan; sesuaikan dengan backend |
| Titik sambung | `useAuth` memanggil registrasi setelah login dan penghapusan sebelum logout | Perubahan minimal, tanpa mengubah alur login |
| Titik sambung | Handler tap memanggil `setActiveTab` yang sudah ada | Tanpa layar atau navigator baru |

Push token **bukan** kredensial login: disimpan di server per akun, tidak masuk AsyncStorage. Aturan penyimpanan di `constants/storage.js` (token auth hanya di SecureStore, password tidak disimpan) tetap berlaku.

## Kriteria penerimaan, demo, dan risiko

Sprint selesai jika satu perubahan status laporan di server sampai ke perangkat mahasiswa dan membuka layar yang benar, tanpa mengubah perilaku fitur lama.

**Kriteria penerimaan**

- [ ] Permission diminta setelah login; menolak tidak membuat aplikasi error dan fitur lama tetap normal.
- [ ] Push token perangkat tersimpan di server untuk akun yang login, dan terhapus saat logout.
- [ ] Admin mengubah status laporan → mahasiswa pelapor menerima notifikasi (foreground, background, terminated).
- [ ] Mahasiswa membuat laporan → admin menerima notifikasi.
- [ ] Menekan notifikasi membuka tab `Reports`; `screen` tak dikenal membuka `Home`.
- [ ] Login, laporan, ruang kelas, kamera, dan profil berjalan seperti sebelum sprint (regresi bersih).

**Skenario demo** (mengikuti Slide 15)

1. Jalankan KampusCare di perangkat fisik dan login sebagai mahasiswa.
2. Setujui permission notifikasi.
3. Perangkat terdaftar dan push token tersimpan di server.
4. Login sebagai admin di perangkat lain, ubah status laporan menjadi Diproses.
5. Notifikasi tampil di perangkat mahasiswa.
6. Tekan notifikasi → aplikasi membuka tab Laporan.

**Risiko & asumsi**

| Risiko / asumsi | Dampak | Penanganan |
|---|---|---|
| Kode backend tidak ada di `src.zip`; endpoint `/api/push/token` dan pemicu di server adalah usulan | Task 02 butuh perubahan backend | Konfirmasi struktur backend; sesuaikan nama endpoint |
| Push token tidak tersedia di emulator/web | Demo tidak bisa di emulator | Uji di perangkat fisik; web dilewati dengan aman |
| Expo Go terbatas untuk push di Android pada SDK terbaru | Notifikasi tidak muncul saat uji | Gunakan development build bila diperlukan |
| Navigasi berbasis `activeTab` tanpa halaman detail laporan | `id` belum membuka satu laporan spesifik | Sprint ini hanya membuka tab `Reports`; detail laporan di luar lingkup |
| Perangkat berganti akun | Notifikasi salah sasaran | Hapus token saat logout (FR-05) |
