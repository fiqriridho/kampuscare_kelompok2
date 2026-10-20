# 🏫 KampusCare — Panduan Integrasi Frontend & Backend

Dokumentasi resmi untuk setup, konfigurasi environment, integrasi API, dan menjalankan aplikasi **KampusCare** (Frontend Expo & Backend Express REST API).

---

## 📌 Gambaran Arsitektur

Proyek KampusCare terdiri dari dua repository yang bekerja bersama:

| Repository | Teknologi | Deskripsi | Port Default |
| :--- | :--- | :--- | :--- |
| **`kampus-care`** (Frontend) | Expo SDK 57, React Native, Expo Router | Aplikasi mobile & web untuk pelaporan fasilitas dan status ruangan | `8081` |
| **`kampus-care-backend`** (Backend) | Node.js, Express 5, JWT, In-Memory / Redis | REST API untuk autentikasi JWT, session recovery, blacklist logout, dan data ruangan | `3000` |

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `>= 18.0.0` (disarankan LTS)
- **npm**: Versi `>= 9.0.0`
- **Git**: Untuk cloning repository
- **Expo Go App**: Jika ingin menguji di HP fisik Android/iOS (unduh dari Google Play Store / App Store)
- **Android Studio & Android Emulator**: Jika ingin menguji via emulator AVD

---

## 🚀 Panduan Setup Langkah-demi-Langkah

Disarankan menempatkan kedua folder proyek berdampingan dalam satu direktori kerja:

```
02_Projects/
├── kampus-care/          # Frontend Expo
└── kampus-care-backend/  # Backend Express API
```

### 1. Setup Backend (`kampus-care-backend`)

Buka terminal pertama dan masuk ke direktori backend:

```bash
cd kampus-care-backend
npm install
```

Salin file environment dari `.env.example`:

- **Windows PowerShell**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS / Git Bash**:
  ```bash
  cp .env.example .env
  ```

Periksa isi file `.env`:
```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=1h
REDIS_URL=redis://localhost:6379
```

> [!NOTE]
> **Redis bersifat opsional!** Jika Redis server lokal tidak aktif, backend otomatis menggunakan *in-memory storage fallback* untuk token blacklist tanpa menghasilkan error.

Jalankan server backend:

- **Mode Development (auto-reload)**:
  ```bash
  npm run dev
  ```
- **Mode Normal**:
  ```bash
  npm start
  ```

Verifikasi server aktif dengan membuka browser di `http://localhost:3000/api/health`. Response yang diharapkan:
```json
{
  "status": "ok",
  "service": "kampuscare-backend",
  "timestamp": "..."
}
```

---

### 2. Setup Frontend (`kampus-care`)

Buka terminal kedua dan masuk ke direktori frontend:

```bash
cd kampus-care
npm install
```

Salin template environment:

- **Windows PowerShell**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **Linux / macOS / Git Bash**:
  ```bash
  cp .env.example .env
  ```

---

## 🌐 Konfigurasi Base URL Berdasarkan Platform

Frontend memiliki mekanisme resolusi URL cerdas di `src/constants/api.js`. Sesuaikan `EXPO_PUBLIC_API_URL` di file `.env` berdasarkan target pengujian Anda:

### A. Pengujian via Expo Web (Browser Laptop/PC)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```
Jalankan frontend:
```bash
npm run web
```
Aplikasi akan terbuka otomatis di browser pada `http://localhost:8081`.

---

### B. Pengujian via Android Emulator (Android Studio / AVD)
Karena Android Emulator berjalan dalam sandbox virtual, `localhost` di dalam emulator merujuk ke emulator itu sendiri. Gunakan IP alias host Android `10.0.2.2`:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```
Jalankan frontend:
```bash
npm run android
```

---

### C. Pengujian via HP Android Fisik (Expo Go via Wi-Fi)
1. Pastikan laptop/PC dan HP terhubung ke **jaringan Wi-Fi yang sama**.
2. Cari alamat IP lokal komputer Anda:
   - **Windows**: Jalankan `ipconfig` di PowerShell/CMD, cari `IPv4 Address` pada adapter Wi-Fi (misalnya `192.168.1.50`).
   - **macOS / Linux**: Jalankan `ifconfig` atau `ip a`.
3. Masukkan IP tersebut ke dalam `.env` frontend:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
   ```
4. Jalankan Expo:
   ```bash
   npm start
   ```
5. Buka aplikasi **Expo Go** di HP, pindai (scan) QR Code yang muncul di terminal.

> [!TIP]
> **Deteksi Otomatis HP Fisik**: Jika `EXPO_PUBLIC_API_URL` tidak diisi, frontend secara otomatis mendeteksi IP host Metro Bundler dari `Constants.expoConfig.hostUri` sehingga tetap dapat terhubung ke backend tanpa konfigurasi manual!

---

## 👤 Kredensial Akun Demo

Untuk masuk ke aplikasi, gunakan akun dummy yang telah terdaftar di database backend:

| Kolom | Nilai Demo |
| :--- | :--- |
| **Email** | `mahasiswa@kampuscare.ac.id` |
| **Password** | `password123` |
| **Nama Pengguna** | Budi Santoso *(Data Dummy)* |
| **NIM** | `2024103701100XX` |
| **Jurusan** | Teknik Informatika |

> [!TIP]
> Pada halaman Login, Anda cukup menekan tombol **"Gunakan Otomatis"** di bawah formulir untuk mengisi email dan kata sandi demo secara instan.

---

## 🔄 Alur Integrasi API & Keamanan Token

1. **Login (`POST /api/auth/login`)**:
   - Frontend mengirim kredensial email & password dalam JSON.
   - Backend memverifikasi hash `bcryptjs` dan menerbitkan token JWT bertanda `jti`.
   - Frontend menyimpan token secara aman menggunakan hardware-backed **Expo SecureStore** di Android/iOS, atau *in-memory session* aman di Expo Web.
   - Profil non-sensitif disimpan ke `AsyncStorage`. Password **TIDAK PERNAH** disimpan di penyimpanan lokal client.

2. **Pemulihan Sesi (`GET /api/auth/me`)**:
   - Saat aplikasi dibuka, frontend mengambil token dari SecureStore dan memverifikasinya ke endpoint `/api/auth/me` dengan header `Authorization: Bearer <token>`.
   - Jika token valid, sesi dilanjutkan dan data profil disinkronkan.
   - Jika token sudah kedaluwarsa atau tercatat di blacklist, token dihapus dan user diarahkan kembali ke layar Login.

3. **Pengambilan Data Ruangan (`GET /api/rooms`)**:
   - Endpoint ruangan dilindungi oleh `authMiddleware`.
   - Frontend menyertakan token aktif untuk mengambil daftar ruangan kampus secara real-time.
   - Dilengkapi fitur *Pull-to-Refresh* dan penanganan status ruangan: Kosong (*Empty*), Digunakan (*Occupied*), Akan Digunakan (*Upcoming*), dan Maintenance.
   - Permintaan awal menampilkan indikator "Memuat data... Mohon tunggu sebentar". Jika permintaan gagal karena jaringan, layar status ruangan menampilkan ikon offline dan pesan "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.".
   - Tombol **Coba Lagi** dan *pull-to-refresh* mengirim ulang permintaan `GET /api/rooms`; data dirender kembali setelah backend dapat dijangkau.

4. **Logout & Blacklist (`POST /api/auth/logout`)**:
   - Pengguna menekan tombol Logout pada layar Profil.
   - Frontend memanggil `POST /api/auth/logout` dengan Bearer token.
   - Backend mencatat `jti` token ke blacklist (Redis / In-Memory). Token yang dicabut tidak dapat digunakan lagi.
   - Frontend menghapus token dari SecureStore dan mereset status aplikasi.

---

## 🧪 Pengujian Otomatis (Testing)

### 1. Test Suite Backend (18 Skenario)
Jalankan di folder `kampus-care-backend`:
```bash
npm test
```
Hasil yang diharapkan: **18 LULUS, 0 GAGAL**.

### 2. Test Integrasi Frontend - Backend (8 Skenario)
Pastikan server backend sedang aktif di port 3000, lalu jalankan di folder `kampus-care`:
```bash
npm run test:integration
```
Hasil yang diharapkan: **8 LULUS, 0 GAGAL**.

---

## ❓ Solusi Masalah Umum (Troubleshooting)

### 1. Error: `Network request failed` atau `ERR_CONNECTION_REFUSED`
- **Penyebab**: Frontend tidak dapat menjangkau port 3000 backend.
- **Solusi**:
  1. Pastikan server backend sedang aktif (`npm run dev` di folder `kampus-care-backend`).
  2. Buka `http://localhost:3000/api/health` di browser untuk memastikan server merespons.
  3. Jika menguji di **HP Fisik**, pastikan HP dan laptop berada di **Wi-Fi yang sama**, dan periksa bahwa `EXPO_PUBLIC_API_URL` menggunakan IP laptop (bukan `localhost`).
  4. Periksa **Windows Defender Firewall**: Izinkan aplikasi `Node.js` menerima koneksi pada jaringan *Private*.

### 2. Error: `Clear Cache Metro`
Jika Anda baru saja mengubah `.env` atau konfigurasi, jalankan Expo dengan membersihkan cache:
```bash
npx expo start -c
```

### 3. Error CORS di Browser
Backend telah dikonfigurasi dengan CORS terbuka untuk development (`credentials: true` dan origin reflection). Jika mengalami masalah CORS saat pengujian via Web, pastikan URL frontend tidak diubah ke domain eksternal tanpa mendaftarkannya di backend `server.js`.
