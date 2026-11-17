# Audit KampusCare Week 1–8 & Kesiapan Week 9

- Tanggal audit: 2026-11-17
- Cakupan: frontend `kampus-care` + backend `kampus-care-backend`
- Metode: pembacaan source code, pemeriksaan git, eksekusi `npm test` backend, `npx tsc --noEmit`, probe runtime backend/MySQL
- Aturan: tidak ada file diubah selama audit; seluruh temuan berbasis bukti file:baris atau output perintah

**Keputusan: NOT READY.**

Backend tidak reproducible (schema/seed tidak tersedia, MySQL `ECONNREFUSED`), suite backend aktual 6 LULUS / 8 GAGAL (README mengklaim 18/18), registrasi frontend memakai token palsu, dan kontrak `/api/rooms` tidak cocok dengan test/frontend.

Bukti eksekusi:

| Pemeriksaan | Hasil |
|---|---|
| `npm test` backend | 6 lulus, 8 gagal, crash `dataRooms.map is not a function` |
| `npx tsc --noEmit` | Exit 0, tetapi hanya memeriksa `.ts/.tsx` (JS tidak dicek) |
| `curl localhost:3000/api/health` | Tidak ada respons (server mati) |
| Probe MySQL 127.0.0.1:3306 | `ECONNREFUSED` |
| `git status` backend | `src/config/database.js` untracked; 5 file modified |
| `git status` frontend | Bersih |

---

## 1. Executive Summary

| Aspek | Kondisi |
|---|---|
| Fondasi auth | Kuat di kode: JWT + `jti` + blacklist fail-closed + SecureStore; lemah di registrasi & verifikasi runtime |
| Fondasi data | Hanya `GET /api/rooms`; tidak ada API laporan; DDL/seed tidak ada |
| UI/UX | Berjalan, loading/error/retry ruangan baik; aksesibilitas & responsif minim |
| Sensor | Kamera + permission lifecycle matang; accelerometer/gyroscope tidak ada |
| Async Week 8 | GET + loading + try/catch + reload ada; POST/PATCH HTTP belum ada |
| Testing | Backend suite tidak hermetik & gagal; integrasi mustahil dijalankan; nol unit test frontend |
| Git | Frontend bersih; backend punya perubahan belum di-commit |

---

## 2. Audit Week 1–8

### Week 1 — Kickoff, ide, workflow, GitHub — `PARTIALLY COMPLETE`

- **Bukti:** 2 repo GitHub (`kampuscare_kelompok2`, `kampuscare_backend`), 16 commit frontend, README setup lengkap.
- **Kekurangan:** tidak ada dokumen workflow/arsitektur keputusan; backend lokal berbeda dari GitHub — `src/config/database.js` untracked, `package.json`, `src/data/rooms.js`, `src/data/users.js`, `src/routes/auth.js`, `src/routes/rooms.js` modified.
- **Risiko:** clone repo tidak bisa menjalankan backend; bukti tugas tidak lengkap.
- **Rekomendasi/prioritas:** commit migrasi MySQL + schema/seed. **P0**.

### Week 2 — React Native, Expo Go, UI, responsif, aksesibilitas — `NEEDS IMPROVEMENT`

- **Bukti:** `AuthScreen.js:46-64` split-screen ≥768px; HomeScreen, ProfileScreen, CameraScreen berjalan; Expo terpasang 58.0.24.
- **Kekurangan:** responsif hanya di AuthScreen; layar lain melebar penuh di web. Hanya 7 properti aksesibilitas (`CameraScreen.js:386-447`, `HomeScreen.js:111-112`, `ProfileScreen.js:69`); nav, form login/register, tombol logout, galeri, "Ambil Ulang" tanpa label/role.
- **Risiko:** nilai aksesibilitas rendah; UI web kurang layak.
- **Rekomendasi/prioritas:** label + role pada semua kontrol interaktif; max-width konten desktop. **P2**.

### Week 3 — Authentication, local data, secure storage, security validation — `PARTIALLY COMPLETE`

- **Bukti:** token hanya SecureStore (`useAuth.js:25-69`), web in-memory (bukan localStorage); profil/riwayat di AsyncStorage (`storage.js`); validasi email/password (`useAuth.js:198-212, 297-327`); login backend nyata (`useAuth.js:216-263`).
- **Kekurangan:**
  - Registrasi tidak memanggil backend: membuat `kc_token_...` palsu (`useAuth.js:340-366`). Saat restart, `/api/auth/me` menolak token → user ter-logout; akun hilang karena `usersList` hanya memori (`useAuth.js:107, 352-359`).
  - `authSuccess` tidak pernah di-set (hanya di-reset) — dead UI state.
  - Tidak ada rate limit/lockout login di backend.
- **Risiko:** fitur daftar akun **BROKEN** secara alur; demo registrasi gagal setelah reload.
- **Rekomendasi/prioritas:** `POST /api/auth/register` + hash bcrypt, atau hapus registrasi mock dan jadikan read-only. **P0**.

### Week 4 — Data modeling, REST API, HTTP, JSON — `PARTIALLY COMPLETE`

- **Bukti:** model Room (`useRooms.js:112-119`), `GET /api/rooms` (`routes/rooms.js:6-13`), JSON request/response login.
- **Kekurangan:**
  - `sql_kampuscare.sql` di `D:\02_Projects` hanya 2 baris `CREATE DATABASE`; tidak ada DDL `users`, `classrooms`, tidak ada seed.
  - Query rooms hanya `id,name,building,status,capacity` (`data/rooms.js:4-8`), sedangkan test dan frontend menuntut `location` + `facilities` (`tests/run_tests.js:131-138`, `useRooms.js:112-119`, `scripts/test-integration.js:113-121`).
  - Tidak ada resource laporan; riwayat hanya AsyncStorage.
- **Risiko:** test T13/T14 dan integrasi #6 pasti gagal; field `facilities` selalu `undefined`.
- **Rekomendasi/prioritas:** DDL + seed di repo; samakan kontrak response. **P0**.

### Week 5 — Secure API, JWT, access token, protected endpoint — `PARTIALLY COMPLETE`

- **Bukti:** `generateToken` + `jti` (`utils/token.js:5-14`), verifikasi header/expiry (`middleware/auth.js:4-57`), blacklist dengan TTL (`data/blacklist.js:9-33`), logout mencabut token (`routes/auth.js:80-94`), route rooms diproteksi (`server.js:47`).
- **Kekurangan:** CORS mengembalikan `true` untuk semua origin (`server.js:22-27`); tidak ada rate limit; login tidak bisa diverifikasi karena DB mati; `/api/auth/me` 404 diperlakukan sebagai token invalid di frontend (`useAuth.js:162-166`).
- **Risiko:** endpoint aman secara desain, tetapi tidak terbukti berjalan end-to-end.
- **Rekomendasi/prioritas:** perbaiki DB dulu, lalu jalankan T01–T18; batasi CORS sesuai env. **P0/P1**.

### Week 6 — Error handling, loading, timeout, offline — `PARTIALLY COMPLETE`

- **Bukti:** loading ruangan (`HomeScreen.js:91-97`), error + retry (`98-116`), pull-to-refresh (`32-39`), offline message via pola error (`useRooms.js:52-70`), try/catch login/logout/report.
- **Kekurangan:** tidak ada timeout/`AbortController` di seluruh fetch (grep: 0 hasil); tidak ada NetInfo; tidak ada cache ruangan → offline hanya pesan, data hilang; 401 pada rooms tidak memicu logout/redirect (`useRooms.js:98-103`); pesan error bergantung pencocokan string.
- **Risiko:** UI dapat menggantung tanpa batas; sesi kedaluwarsa membuat user terjebak.
- **Rekomendasi/prioritas:** `apiClient` dengan timeout 10 detik + handler 401 global + cache AsyncStorage. **P1**.

### Week 7 — Sensor, permission, accelerometer, gyroscope — `PARTIALLY COMPLETE`

- **Bukti:** `useCameraPermissions`, refresh izin saat `AppState` aktif, buka Settings, galeri (`CameraScreen.js:28-99, 135-198`); permission dideklarasikan di `app.json`.
- **Kekurangan:** `expo-sensors` tidak terpasang (`node_modules/expo-sensors` absen); nol pemakaian Accelerometer/Gyroscope/DeviceMotion. Tidak ada fallback sensor.
- **Risiko:** kompetensi sensor mingguan tidak terpenuhi; hanya kamera yang dinilai.
- **Rekomendasi/prioritas:** tambahkan satu use case sensor nyata (mis. shake-to-refresh ruangan atau indikator stabilitas saat foto) + permission/lifecycle. **P1**.

### Week 8 — Multi-threading, Event Loop, Promise, async/await, useEffect, state, Todo List Async — `PARTIALLY COMPLETE`

- **Bukti:** async/await di seluruh I/O; `useEffect` fetch ruangan (`useRooms.js:191-193`); GET + loading + error + tombol reload (`HomeScreen.js:85-116`); `showAlert` try/catch pada laporan (`useAuth.js:459-492`); Alert native/web (`useAuth.js:71-77`).
- **Kekurangan:** POST API tidak ada, PATCH API tidak ada; laporan hanya ditulis ke AsyncStorage; tidak ada Todo List Async; tidak ada pembatalan request/race guard; logika fetch terduplikasi persis (`useRooms.js:79-132` vs `134-188`).
- **Risiko:** 3 dari 6 kompetensi inti Week 8 belum terbukti; Week 9 tidak punya jalur integrasi.
- **Rekomendasi/prioritas:** jadikan CRUD laporan sebagai laboratorium GET/POST/PATCH. **P1**, dieksekusi di Week 9.

---

## 3. Tabel Status Seluruh Penugasan

| Minggu | Komponen | Status |
|---|---|---|
| 1 | Ide aplikasi | COMPLETE |
| 1 | Workflow & dokumentasi | PARTIALLY COMPLETE |
| 1 | GitHub sinkron | PARTIALLY COMPLETE |
| 2 | React Native/Expo Go | COMPLETE |
| 2 | UI | COMPLETE |
| 2 | Responsive design | PARTIALLY COMPLETE |
| 2 | Accessibility | NEEDS IMPROVEMENT |
| 3 | Login + session | COMPLETE |
| 3 | Registrasi | BROKEN |
| 3 | Secure storage token | COMPLETE |
| 3 | Penyimpanan data lokal | COMPLETE |
| 3 | Security validation | NEEDS IMPROVEMENT |
| 4 | Data modeling | PARTIALLY COMPLETE |
| 4 | REST API | PARTIALLY COMPLETE |
| 4 | JSON request/response | COMPLETE |
| 5 | JWT + access token | COMPLETE (kode) |
| 5 | Protected endpoint | COMPLETE (kode) |
| 5 | Verifikasi runtime | BROKEN (DB) |
| 6 | Error handling | COMPLETE |
| 6 | Loading state | COMPLETE |
| 6 | Timeout | NOT IMPLEMENTED |
| 6 | Offline handling | PARTIALLY COMPLETE |
| 7 | Device permission | COMPLETE |
| 7 | Kamera | COMPLETE |
| 7 | Accelerometer/Gyroscope | NOT IMPLEMENTED |
| 8 | async/await + Promise + Event Loop | COMPLETE |
| 8 | useEffect + state | COMPLETE |
| 8 | GET API + loading + reload | COMPLETE |
| 8 | POST API | NOT IMPLEMENTED |
| 8 | PATCH API | NOT IMPLEMENTED |
| 8 | try/catch + Alert | COMPLETE |
| 8 | Todo List Async | NOT IMPLEMENTED |

---

## 4. Temuan Masalah & Kekurangan

| ID | Sev | Temuan | Bukti | Risiko | Perbaikan | Prioritas |
|---|---|---|---|---|---|---|
| F1 | Kritis | Schema/seed DB tidak ada; MySQL tidak berjalan | `sql_kampuscare.sql` 2 baris; probe 3306 `ECONNREFUSED` | Backend tidak bisa login/rooms; demo gagal | DDL + seed + instruksi setup | P0 |
| F2 | Kritis | Suite backend gagal & crash | Run aktual: 6 lulus, 8 gagal; `dataRooms.map` TypeError | Klaim README palsu; tidak ada regression net | Perbaiki kontrak + DB test | P0 |
| F3 | Kritis | Kontrak rooms tidak konsisten | `data/rooms.js:4-8` vs `tests/run_tests.js:131` vs `useRooms.js:112-119` | `location/facilities` undefined; test #6 gagal | Satu kontrak: `location`, `facilities` | P0 |
| F4 | Kritis | Registrasi membuat JWT palsu | `useAuth.js:361-366` | Akun tidak valid setelah restart; auth loop | Endpoint register + bcrypt | P0 |
| F5 | Tinggi | Perubahan backend belum di-commit | `git status` backend | Review/dosen tidak melihat implementasi | Commit DB layer + schema | P0 |
| F6 | Tinggi | POST/PATCH laporan tidak ada | grep route backend; `useAuth.js:459-493` | Kompetensi Week 8 & 9 tidak terpenuhi | Bangun API laporan | P1 |
| F7 | Tinggi | Tidak ada timeout request | grep `AbortController/setTimeout` = 0 | Spinner menggantung | `apiClient` timeout 10 detik | P1 |
| F8 | Sedang | Sesi 401 tidak memicu logout | `useRooms.js:98-103` | User terjebak, data tidak dimuat | Handler 401 global | P1 |
| F9 | Sedang | Duplikasi fetch rooms | `useRooms.js:79-132, 134-188` | Bug ganda saat diperbaiki | Ekstrak fetch bersama | P1 |
| F10 | Sedang | Tidak ada sensor gerak | `expo-sensors` absen | Week 7 tidak lengkap | Satu use case sensor | P1 |
| F11 | Sedang | CORS menerima semua origin | `server.js:22-27` | Permukaan serangan melebar | Allowlist dari env | P1 |
| F12 | Sedang | Aksesibilitas minim | 7 properti di seluruh `src` | Skor a11y rendah | Role/label menyeluruh | P2 |
| F13 | Rendah | Dead code/state | `authSuccess`, `mockClassrooms`, `usersList`, `roomErrorIcon`, kartu tanpa `onPress`, "Lihat Semua" tanpa aksi | Kebingungan maintenance | Hapus/aktifkan | P2 |
| F14 | Rendah | 10 dependency tidak dipakai | `@expo/ui`, reanimated, gesture-handler, glass-effect, expo-image, symbols, font, web-browser, device, linking | Bundle/install membengkak | Hapus setelah verifikasi | P2 |
| F15 | Rendah | Dokumentasi versi salah | `AGENTS.md` v57; README SDK 57; terpasang Expo 58.0.24 | Referensi API keliru | Selaraskan dokumen | P2 |
| F16 | Rendah | TypeScript tidak memeriksa JS | `tsconfig.json include` hanya ts/tsx; `tsc` lolos | Bug runtime tak terdeteksi | `checkJs`/migrasi bertahap | P2 |

---

## 5. Evaluasi Kualitas & Optimalisasi

| Dimensi | Status | Catatan |
|---|---|---|
| Struktur frontend | Needs improvement | `useAuth` 550 baris menampung auth+nav+form+laporan; `App.js` meneruskan 30+ props |
| Struktur backend | Cukup | Layer route/data/config/middleware jelas |
| Konsistensi kode | Cukup | Komentar dan pesan konsisten; error handling DB seragam 500 |
| Duplikasi/dead code | Needs improvement | Fetch rooms duplikat; state/dependency mati (F13/F14) |
| Keamanan auth/JWT | Baik | `jti`, expiry, blacklist TTL, fail-closed 503, pesan login seragam |
| Penyimpanan token | Baik | SecureStore native; web in-memory (refresh = logout, disengaja) |
| Validasi data | Needs improvement | Client-side saja; backend hanya cek tipe; tanpa panjang/rate limit |
| REST API & database | Buruk | Hanya 2 resource; DDL/seed hilang; kontrak tidak seragam |
| Async processing | Cukup | async/await konsisten; tanpa cancellation/race guard |
| Loading & error | Baik | Rooms & auth punya state eksplisit; error inline |
| Offline handling | Kurang | Deteksi via string; tanpa cache; laporan lokal tidak tersinkron |
| Permission & sensor lifecycle | Baik (kamera), buruk (sensor) | AppState refresh + Settings fallback; tidak ada accel/gyro |
| Performa | Cukup | Data kecil; `ScrollView` untuk list; state form di root memicu render seluruh tree |
| Integrasi FE–BE | Tidak terverifikasi | Backend mati; test integrasi menuntut field yang tidak dikirim |
| Kualitas testing | Buruk | Backend non-hermetik, bergantung seed 4 ruangan, crash; tanpa test frontend/CI |
| Kompatibilitas Expo Go | Baik | Tanpa native module kustom; versi paket selaras SDK 58; `expo-file-system` API baru valid |

---

## 6. Week 9 Readiness Decision

**NOT READY.**

1. **Siap?** Belum.
2. **Fondasi cukup baik:** pemisahan token SecureStore vs AsyncStorage, middleware JWT + blacklist, permission lifecycle kamera, pola loading/error/retry ruangan, resolusi base URL multi-platform, dokumentasi setup.
3. **Blocker:** F1 schema/seed+DB, F2 suite gagal, F3 kontrak rooms, F4 registrasi token palsu, F5 backend belum di-commit.
4. **Harus diperbaiki dulu:** F1–F5. F6/F7 dapat dikerjakan sebagai bagian Week 9.
5. **Risiko lanjut langsung:** CRUD laporan akan dibangun di atas auth yang tidak valid dan test yang tidak bisa dipercaya; kontrak API berubah dua kali; waktu habis untuk rework.

---

## 7. Daftar Pekerjaan Sebelum Week 9

| No | Pekerjaan | Kriteria selesai |
|---|---|---|
| 1 | `db/schema.sql` + `db/seed.sql` (users, classrooms, reports) | `mysql < schema.sql && mysql < seed.sql` menghasilkan 4 ruangan + akun demo |
| 2 | Seed rooms lengkap `location`, `facilities`, 4 status | T13/T14 lulus |
| 3 | `POST /api/auth/register` + bcrypt + unique email | Registrasi bertahan setelah restart; login token valid |
| 4 | Hapus/migrasikan registrasi mock frontend | Tidak ada token `kc_token_*` |
| 5 | Jalankan `npm test` backend | 18/18 lulus tanpa crash |
| 6 | Jalankan `npm run test:integration` | 8/8 lulus |
| 7 | Commit seluruh perubahan backend | `git status` bersih, remote sinkron |
| 8 | Selaraskan README/AGENTS ke SDK 58 | Tidak ada rujukan v57 |

---

## 8. Week 9 Implementation Plan — USULAN

> Tidak ditemukan instruksi resmi Week 9 di repo maupun materi kuliah. Seluruh isi bagian ini adalah usulan berbasis kelanjutan Week 8 (Todo List Async: GET, POST, PATCH, loading, Alert, reload) dan fitur existing KampusCare.

### 8.1 Fitur

**Modul Laporan Fasilitas end-to-end**: daftar laporan (GET), buat laporan dari kamera/galeri (POST), ubah/batalkan laporan milik sendiri (PATCH), dengan loading, timeout, Alert, reload, dan cache offline. Foto diunggah ke backend.

### 8.2 Alasan

- Melengkapi 3 kompetensi Week 8 yang belum ada (POST/PATCH) tanpa fitur mainan terpisah.
- Menghidupkan kartu "Fasilitas & Laporan" (`HomeScreen.js:72-79`) dan riwayat profil yang saat ini lokal.
- Memakai auth, kamera, permission, dan pola error/loading yang sudah ada.

### 8.3 Frontend changes

- `src/services/apiClient.js`: wrapper fetch, Bearer token, timeout 10 detik (`AbortController`), parsing JSON aman, handler 401 → hapus token + logout.
- `src/hooks/useReports.js`: `reports`, `isLoading`, `error`, `isOffline`, `isRefreshing`, `createReport`, `updateReport`, `refresh`; cache AsyncStorage; cleanup abort.
- `src/app/ReportsScreen.js`: daftar + filter status + tombol "Muat Ulang" + pull-to-refresh + empty/error/loading.
- `CameraScreen`: `submitReport` → POST API (bukan AsyncStorage); tampilkan Alert sukses/gagal; pertahankan foto lokal sampai sukses.
- `HomeScreen`: ganti `mockReports` dengan data API + navigasi ke ReportsScreen; hapus kartu tanpa aksi.
- `ProfileScreen`: riwayat dari `useReports` (cache), bukan hanya AsyncStorage.
- `App.js`/`BottomNavigation`: tab keempat "Laporan"; pertahankan tab Camera utama.
- `useRooms`: migrasi ke `apiClient` untuk menghapus duplikasi.

### 8.4 Backend changes

- `src/routes/reports.js`: GET/POST/PATCH terproteksi `authMiddleware`.
- `src/data/reports.js`: query MySQL, kepemilikan via `user_id`.
- `src/middleware/upload.js`: multer disk storage, validasi MIME + maks 5 MB; serve `/uploads` statis.
- Validasi input: deskripsi 10–1000 karakter, lokasi wajib, whitelist field PATCH, status hanya `Dibatalkan` oleh pemilik.
- Dependency baru: `multer` (satu-satunya; tidak dipasang saat audit).

### 8.5 Database changes

```sql
CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  status ENUM('Menunggu','Diproses','Selesai','Dibatalkan') NOT NULL DEFAULT 'Menunggu',
  photo_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_reports_user_created (user_id, created_at),
  INDEX idx_reports_status (status)
);
```

Tidak ada tabel baru lain. Judul diisi server dari 80 karakter pertama deskripsi (menghindari input form baru).

### 8.6 API endpoint

| Method | Endpoint | Auth | Body/Query | Response |
|---|---|---|---|---|
| GET | `/api/reports` | Bearer | `?status=` `?mine=1` | `200` array |
| POST | `/api/reports` | Bearer | multipart: `description`, `location`, `photo?` | `201` objek |
| PATCH | `/api/reports/:id` | Bearer | JSON `description?`, `location?`, `status?` | `200` objek |
| GET | `/api/reports/:id` | Bearer | – | `200` objek |
| GET | `/uploads/:file` | publik | – | gambar |

Kode: `400` validasi, `401` token, `403` bukan pemilik, `404` tidak ada, `409` status tidak dapat diubah, `500` generik.

### 8.7 File terdampak

Lihat bagian 9.

### 8.8 Alur asynchronous

1. Mount ReportsScreen → `useEffect` → `refresh()` → `apiClient.get` dengan AbortController.
2. Render loading → data/error/offline (cache AsyncStorage).
3. Submit kamera → validasi → POST multipart → tombol disabled + spinner → Alert sukses → refetch + pindah tab.
4. PATCH → tanpa optimistic update; tunggu respons, lalu update item di state + Alert.
5. Timeout/abort → error "Koneksi lambat" + tombol Coba Lagi.
6. 401 → bersihkan token → kembali ke AuthScreen.

### 8.9 Testing strategy

- Backend: perluas `tests/run_tests.js` (R01–R12) memakai DB test terpisah + seed; kasus: GET kosong, GET terisi, POST valid/invalid, POST tanpa token, PATCH pemilik, PATCH orang lain (403), PATCH status ilegal (409), foto MIME salah.
- Integrasi: tambah skenario 9–14 di `scripts/test-integration.js`.
- Manual Expo Go: izin kamera, unggah foto, airplane mode, backend dimatikan (timeout), reload, PATCH, logout saat request berjalan.
- Tanpa framework test frontend baru; satu skrip integrasi tetap menjadi regression check.

### 8.10 Acceptance criteria

| AC | Kriteria |
|---|---|
| AC1 | GET `/api/reports` 401 tanpa token, 200 array dengan token |
| AC2 | POST membuat baris DB dengan `user_id` dari JWT, bukan body |
| AC3 | POST menolak deskripsi <10 karakter dan file non-gambar |
| AC4 | PATCH hanya mengubah laporan milik sendiri; selain itu 403 |
| AC5 | PATCH status hanya ke `Dibatalkan`; status lain 409 |
| AC6 | ReportsScreen menampilkan loading, error, empty, dan data |
| AC7 | Tombol "Muat Ulang" + pull-to-refresh memicu GET ulang |
| AC8 | Semua kegagalan POST/PATCH memunculkan Alert dan tidak menghapus input |
| AC9 | Request timeout 10 detik menghasilkan pesan dan tombol retry |
| AC10 | 401 memaksa logout dan membersihkan SecureStore |
| AC11 | Data tetap terlihat dari cache saat offline |
| AC12 | Suite backend dan integrasi lulus 100% |

### 8.11 Urutan pengerjaan

1. **Fase 0** — P0-1..P0-7 (schema, seed, register, kontrak rooms, commit).
2. **Fase 1** — DDL reports + data layer + route GET/POST/PATCH + upload + test backend.
3. **Fase 2** — `apiClient` + `useReports`.
4. **Fase 3** — ReportsScreen, integrasi Camera/Home/Profile/nav.
5. **Fase 4** — timeout, offline cache, 401 handling, bersihkan duplikasi `useRooms`.
6. **Fase 5** — test integrasi, dokumentasi endpoint, verifikasi Expo Go.

---

## 9. Daftar File yang Akan Terdampak

| Aksi | File |
|---|---|
| Baru (backend) | `kampus-care-backend/db/schema.sql`, `db/seed.sql`, `src/data/reports.js`, `src/routes/reports.js`, `src/middleware/upload.js`, `uploads/.gitkeep` |
| Ubah (backend) | `server.js` (mount reports + static uploads), `tests/run_tests.js`, `README.md`, `package.json` (multer), `.env.example` (opsional `UPLOAD_DIR`) |
| Baru (frontend) | `src/services/apiClient.js`, `src/hooks/useReports.js`, `src/app/ReportsScreen.js` |
| Ubah (frontend) | `App.js`, `src/hooks/useAuth.js`, `src/hooks/useRooms.js`, `src/app/CameraScreen.js`, `src/app/HomeScreen.js`, `src/app/ProfileScreen.js`, `src/components/BottomNavigation.js`, `src/constants/api.js`, `src/components/ReportCard.js`, `scripts/test-integration.js`, `README.md` |
| Hapus/dibersihkan | `mockReports` dari HomeScreen, `mockClassrooms`, state `authSuccess`/`usersList` bila registrasi backend selesai |

---

## 10. Acceptance Criteria & Testing Plan

### 10.1 Struktur pengujian

| Level | Cakupan | Alat | Gate |
|---|---|---|---|
| Backend kontrak | Legacy T01–T18 + laporan R01–R12 | `npm test` di `kampus-care-backend` | Exit 0 |
| Integrasi FE–BE | Login, sesi, rooms, reports | `npm run test:integration` | Exit 0 |
| Manual UI | Expo Web + Expo Go Android | Checklist M1–M14 | Semua lulus |
| Statik | Type check + pencarian artefak terlarang | `npx tsc --noEmit`, `grep` | Exit 0 / 0 match |

Tidak ada framework test frontend baru. Skrip integrasi tetap menjadi satu-satunya regression check frontend, sesuai kondisi repo.

### 10.2 Matriks test backend laporan

Fixture: database `kampus_care_test`, di-reset sebelum suite, berisi 1 user demo dan 4 classroom. Dua user untuk kasus kepemilikan.

| ID | Skenario | Ekspektasi |
|---|---|---|
| R01 | `GET /api/reports` tanpa token | `401` |
| R02 | `GET /api/reports` token valid, tabel kosong | `200 []` |
| R03 | `POST /api/reports` deskripsi+lokasi valid | `201`, `user_id` = `userId` dari JWT, `title` ≤80 karakter, `status` `Menunggu` |
| R04 | `POST` tanpa `description` | `400` |
| R05 | `POST` deskripsi 9 karakter | `400` |
| R06 | `POST` foto `text/plain` | `400`, file tidak tersimpan |
| R07 | `POST` tanpa token | `401` |
| R08 | `PATCH` milik sendiri (`description`, `location`) | `200`, nilai berubah, `updated_at` naik |
| R09 | `PATCH` laporan user lain | `403`, data tidak berubah |
| R10 | `PATCH` `status=Selesai` oleh pemilik | `409` |
| R11 | `PATCH` `status=Dibatalkan` oleh pemilik | `200` |
| R12 | `GET /api/reports/:id` tidak ada | `404` |

Baseline legacy: T01–T18 harus tetap lulus. Total suite setelah Week 9: **30 test** (18 legacy + 12 laporan), bukan lagi 18. README wajib diperbarui agar tidak ada klaim angka usang.

### 10.3 Tambahan skrip integrasi

| # | Skenario | Ekspektasi |
|---|---|---|
| 9 | `GET /api/reports` dengan token login | `200` array |
| 10 | `POST /api/reports` | `201` + `id` |
| 11 | `GET /api/reports` ulang | Laporan baru terlihat |
| 12 | `PATCH /api/reports/:id` `Dibatalkan` | `200` |
| 13 | `GET /api/reports` ulang | Status berubah |
| 14 | `GET /api/reports` setelah logout | `401` |

Skrip lama #1–#8 dipertahankan. Skrip harus keluar dengan kode 0 hanya jika 14/14 lulus, dan berhenti dengan pesan jelas jika backend tidak aktif.

### 10.4 Matriks manual UI

| ID | Skenario | Bukti lulus |
|---|---|---|
| M1 | Login akun demo | Masuk ke Home, token tersimpan |
| M2 | Buka tab Laporan | Loading → daftar/empty state |
| M3 | Tombol "Muat Ulang" | Request GET baru, spinner singkat |
| M4 | Pull-to-refresh | Data ter-refresh tanpa crash |
| M5 | Buat laporan via kamera | Izin diminta sekali, POST sukses, item muncul |
| M6 | Buat laporan via galeri | Sama seperti M5 |
| M7 | POST gagal (backend mati) | Alert error, input tidak hilang |
| M8 | Batalkan laporan sendiri | Status jadi `Dibatalkan` setelah PATCH |
| M9 | Airplane mode | Cache tampil + banner offline, tanpa crash |
| M10 | Timeout (backend dihentikan) | Pesan timeout ≤15 detik + tombol retry |
| M11 | Token kedaluwarsa/di-blacklist | Logout paksa, SecureStore bersih, kembali ke Auth |
| M12 | Reload aplikasi setelah login | Sesi pulih via `/api/auth/me` |
| M13 | Expo Go Android | Tidak ada error native module |
| M14 | TalkBack/VoiceOver spot check | Tab, tombol kamera, logout terbaca |

### 10.5 Acceptance criteria final Week 9

| AC | Kriteria terukur |
|---|---|
| AC1 | `GET /api/reports` 401 tanpa token, 200 array dengan token |
| AC2 | `user_id` berasal dari JWT, bukan body; diverifikasi R03 |
| AC3 | Validasi panjang & MIME lulus R04–R06 |
| AC4 | Kepemilikan ditegakkan R09 (403) |
| AC5 | Transisi status ilegal ditolak R10 (409) |
| AC6 | UI punya empat state eksplisit: loading, error, empty, data |
| AC7 | Reload + pull-to-refresh memicu GET (M3, M4) |
| AC8 | Kegagalan POST/PATCH memunculkan Alert dan mempertahankan input (M7) |
| AC9 | Timeout 10 detik menghasilkan pesan + retry (M10) |
| AC10 | 401 memicu logout paksa + hapus token (M11) |
| AC11 | Cache offline menampilkan data terakhir (M9) |
| AC12 | `npm test` 30/30 exit 0; `npm run test:integration` 14/14 exit 0 |

### 10.6 Definition of Done (perintah + ekspektasi)

| Perintah | Ekspektasi |
|---|---|
| `mysql ... < db/schema.sql && mysql ... < db/seed.sql` | Tabel `users`, `classrooms`, `reports` ada; seed 1 user + 4 rooms |
| `cd kampus-care-backend && npm test` | `30 LULUS, 0 GAGAL`, exit code 0, tanpa `Assertion failed` |
| `cd kampus-care && npm run test:integration` | `14 LULUS, 0 GAGAL`, exit code 0 |
| `cd kampus-care && npx tsc --noEmit` | Exit code 0 |
| `grep -rn "kc_token_" src` | 0 hasil |
| `grep -rn "mockReports" src` | 0 hasil |
| `git status --porcelain` (backend) | Kosong |

### 10.7 Regression & pembersihan

- T01–T18 dan integrasi #1–#8 tidak boleh berubah perilaku selain field kontrak rooms yang diselaraskan.
- Hapus jalur tulis lokal `handleCreateNewReport` → AsyncStorage setelah POST sukses; satu penulis data: API.
- Hapus `mockReports`, `mockClassrooms`, state `authSuccess`, dan dependency tak terpakai hanya setelah seluruh gate lulus.
- Perbarui README: jumlah test, endpoint laporan, perintah reset DB, versi SDK 58.

---

## 11. Validasi Konsistensi Rekomendasi Week 9

### 11.1 Inkonsistensi yang ditemukan dan koreksinya

| # | Inkonsistensi | Koreksi |
|---|---|---|
| 1 | Fase 2 menempatkan test backend laporan setelah hook frontend | Test backend pindah ke Fase 1; frontend baru mulai setelah route laporan lulus R01–R12 |
| 2 | Profil memakai `useReports` sekaligus `handleCreateNewReport` masih menulis AsyncStorage | Tetapkan API sebagai satu-satunya penulis; AsyncStorage hanya cache baca |
| 3 | AC5 hanya mengizinkan `Dibatalkan`, tetapi enum DB memuat `Diproses`/`Selesai` | Nyatakan eksplisit: status lanjutan hanya diubah manual/seed; belum ada peran admin. Jangan buat endpoint admin diam-diam |
| 4 | Foto disimpan lokal (`saveReportPhoto`) sekaligus diunggah | Unggahan server adalah sumber kebenaran; salinan lokal hanya untuk preview instan dan boleh gagal tanpa membatalkan POST |
| 5 | AC10 logout paksa vs `checkActiveSession` yang meng-autentikasi saat offline | Handler 401 hanya aktif untuk respons HTTP 401, bukan kegagalan jaringan; jalur offline tidak berubah |
| 6 | README menyebut 18 test, sedangkan plan menambah 12 | Angka baru 30; README diperbarui dalam Fase 5 |
| 7 | `multer` dependency baru vs aturan audit "jangan instal" | Instalasi hanya saat EXECUTE dan hanya setelah persetujuan; alternatif base64 ditolak karena membengkakkan DB |
| 8 | Kartu "Fasilitas & Laporan" belum punya handler, sedangkan plan mengandalkannya | ReportsScreen + tab Laporan dibuat lebih dulu; kartu baru diarahkan setelah screen ada |

### 11.2 Dependency antar-fase

| Fase | Pekerjaan | Bergantung pada | Gate keluar |
|---|---|---|---|
| 0 | Schema/seed, register backend, kontrak rooms, commit, suite legacy hijau | — | G0 |
| 1 | DDL `reports`, data layer, route GET/POST/PATCH, upload, test R01–R12 | Fase 0 (user valid + DB) | G1 |
| 2 | `apiClient` (timeout, 401), `useReports` | Fase 1 (kontrak endpoint) | G2 |
| 3 | ReportsScreen, tab, integrasi Camera/Home/Profile | Fase 2 (hook stabil) | G3 |
| 4 | Cache offline, hapus duplikasi `useRooms`, satu penulis data | Fase 3 (alur UI ada) | G4 |
| 5 | Integrasi 14 skenario, dokumentasi, Expo Go | Fase 1–4 | G5 |

Aturan gate: fase berikutnya tidak dimulai sebelum gate sebelumnya lulus. F6/F7 (POST/PATCH, timeout) bukan blocker pra-Week 9; keduanya adalah isi Fase 1–2. F1–F5 tetap blocker dan harus lulus G0.

Urutan lama "Fase 0 → 1 → 2 → 3 → 4 → 5" tetap valid setelah koreksi #1; tidak ada dependency melingkar. `apiClient` mengimpor helper token dari `useAuth`, dan `useAuth` tidak mengimpor `apiClient`, sehingga tidak ada siklus impor.

---

## 12. Kriteria Penyelesaian Blocker P0 (Terukur)

| ID | Blocker | Kriteria lulus | Bukti |
|---|---|---|---|
| P0-1 | Schema/seed DB hilang | `SHOW TABLES` memuat `users`, `classrooms`, `reports`; seed tepat 1 user demo + 4 rooms; 4 status rooms terwakili | Output SQL + `SELECT COUNT(*)` |
| P0-2 | Kontrak rooms tidak konsisten | Response memuat `id,name,status,capacity,location,facilities`; T13/T14 lulus; integrasi #6 lulus | `npm test`, skrip integrasi |
| P0-3 | Registrasi token palsu | `POST /api/auth/register` → 201; duplikat → 409; login akun baru → JWT valid; `/api/auth/me` → 200 setelah restart backend; `grep kc_token_` = 0 | Curl + grep |
| P0-4 | Suite backend gagal | `npm test` exit 0; 18/18 legacy lulus; tidak ada TypeError/crash | Log suite |
| P0-5 | Integrasi tidak dapat dijalankan | `npm run test:integration` exit 0; 8/8 lulus | Log skrip |
| P0-6 | Backend belum di-commit | `git status --porcelain` kosong; `git ls-files src/config/database.js` mengembalikan path | Output git |
| P0-7 | Dokumen versi salah | README/AGENTS tidak lagi merujuk SDK 57; menyebut 58.0.24 | Grep dokumen |

G0 dinyatakan lulus hanya jika P0-1 sampai P0-7 semuanya terpenuhi. Tidak ada pekerjaan Week 9 yang dimulai sebelum itu.

---

## 13. Final Summary

**Status kesiapan: NOT READY.** Kesiapan Week 9 bergantung sepenuhnya pada G0. Setelah G0 lulus, status berubah menjadi **READY WITH MINOR FIXES** karena F6, F7, F9, F10 masih harus diselesaikan di dalam Week 9.

Urutan pekerjaan yang harus dilakukan:

1. Hidupkan MySQL, masukkan `db/schema.sql` + `db/seed.sql` ke repo, verifikasi tabel dan seed.
2. Selaraskan kontrak `/api/rooms` (`location`, `facilities`) dengan test dan frontend.
3. Implementasikan `POST /api/auth/register` + bcrypt + validasi duplikat; hapus registrasi mock.
4. Hijaukan suite legacy 18/18 dan integrasi 8/8.
5. Commit seluruh perubahan backend, termasuk `src/config/database.js`.
6. Bangun resource laporan: DDL, data layer, route GET/POST/PATCH, upload, R01–R12.
7. Bangun `apiClient` + `useReports`; terapkan timeout, handler 401, cache offline.
8. Integrasikan ReportsScreen, Camera POST, Home, Profile, tab Laporan; hapus `mockReports` dan jalur tulis ganda.
9. Jalankan integrasi 14/14, checklist M1–M14, perbarui dokumentasi, bersihkan dependency mati.

Belum masuk tahap EXECUTE. Menunggu persetujuan.
