Bertindaklah sebagai Senior React Native Developer yang profesional dan berpengalaman dalam pengembangan aplikasi mobile, GPS Integration, Maps SDK, Reverse Geocoding, dan Geofencing.

Saya ingin mengembangkan fitur Location-Based Services (LBS) pada aplikasi KampusCare yang sudah tersedia.

Gunakan React Native dengan JavaScript atau TypeScript sesuai bahasa yang telah digunakan dalam project. Implementasikan seluruh fitur secara fungsional dan terintegrasi dengan sistem aplikasi yang sudah ada.

### 1. Analisis Project Sebelum Implementasi

Sebelum melakukan perubahan kode, lakukan pemeriksaan terlebih dahulu terhadap:

- Struktur folder dan file project.
- Framework dan versi React Native yang digunakan.
- Identifikasi apakah project menggunakan Expo atau React Native CLI.
- File navigasi dan halaman yang berkaitan dengan pelaporan kerusakan.
- Dependensi dan library yang sudah terpasang.
- Mekanisme pengambilan, penyimpanan, dan pengiriman data laporan.
- Konfigurasi API dan backend yang digunakan.

Jangan langsung mengubah kode sebelum memahami struktur dan alur kerja aplikasi.

### 2. Implementasi Pengambilan Lokasi GPS

Implementasikan fitur untuk mengambil lokasi aktual pengguna menggunakan GPS perangkat.

Ketentuan:
- Tambahkan mekanisme permintaan izin akses lokasi kepada pengguna.
- Tangani kondisi ketika izin lokasi diberikan, ditolak, atau layanan lokasi tidak aktif.
- Ambil koordinat latitude dan longitude.
- Ambil informasi accuracy untuk mengetahui tingkat ketepatan lokasi.
- Sediakan tombol untuk mengambil atau memperbarui lokasi.
- Tampilkan informasi koordinat lokasi pengguna.
- Pastikan lokasi diperoleh dari perangkat secara aktual, bukan menggunakan koordinat statis atau data dummy.

### 3. Integrasi Peta (Maps SDK)

Integrasikan peta ke dalam aplikasi menggunakan library yang kompatibel dengan versi React Native dan konfigurasi project.

Ketentuan:
- Gunakan react-native-maps apabila sesuai dengan lingkungan project.
- Tampilkan peta pada halaman formulir pelaporan kerusakan.
- Tampilkan marker sebagai penanda lokasi pengguna.
- Atur camera position agar berfokus pada koordinat terkini.
- Perbarui marker ketika lokasi pengguna berubah.
- Sediakan kontrol untuk memusatkan kembali peta pada lokasi pengguna.
- Izinkan pengguna menyesuaikan titik lokasi laporan melalui peta jika diperlukan.
- Pastikan tampilan peta responsif dan menyatu dengan desain KampusCare.

### 4. Implementasi Reverse Geocoding

Implementasikan fungsi untuk mengubah koordinat latitude dan longitude menjadi informasi alamat yang dapat dibaca.

Ketentuan:
- Gunakan layanan Reverse Geocoding yang sesuai.
- Ambil alamat berdasarkan koordinat GPS atau marker yang dipilih pengguna.
- Tampilkan hasil alamat pada formulir pelaporan.
- Perbarui alamat apabila lokasi marker berubah.
- Tangani kondisi ketika alamat tidak ditemukan, API gagal, atau koneksi internet bermasalah.
- Hindari penggunaan alamat statis atau data dummy.

### 5. Implementasi Geofencing

Implementasikan mekanisme Geofencing untuk menentukan apakah pengguna berada di dalam atau di luar area tertentu.

Ketentuan:
- Tentukan area virtual berdasarkan koordinat dan radius tertentu.
- Gunakan area kampus sebagai wilayah geofence yang dapat dikonfigurasi.
- Periksa posisi pengguna berdasarkan koordinat GPS aktual.
- Deteksi kondisi ketika pengguna memasuki atau meninggalkan area geofence.
- Berikan indikator atau notifikasi sesuai perubahan status lokasi.
- Tampilkan informasi apakah pengguna berada di dalam atau di luar area kampus.
- Pastikan pemeriksaan lokasi tidak dilakukan secara berlebihan sehingga menghabiskan baterai.

### 6. Penempatan dan Integrasi UI

Pertahankan desain aplikasi KampusCare yang sudah tersedia. Jangan membuat menu navigasi baru hanya untuk menampung fitur lokasi.

Integrasikan fitur dengan penempatan berikut:

**A. Halaman Fasilitas & Laporan**

Pada halaman formulir pelaporan kerusakan, tambahkan bagian informasi lokasi yang berisi:
- Tombol ambil lokasi terkini.
- Peta dengan marker lokasi.
- Informasi latitude dan longitude.
- Informasi alamat hasil Reverse Geocoding.
- Informasi status area Geofencing.
- Tombol untuk memperbarui lokasi.

Bagian lokasi harus menjadi bagian dari formulir pelaporan yang sudah tersedia, bukan membuat alur pelaporan baru.

**B. Halaman Kamera**

Pertahankan fungsi kamera yang sudah ada. Jika kamera digunakan untuk mengambil foto kerusakan, integrasikan hasil foto dengan formulir laporan yang sama tanpa mengubah mekanisme kamera yang sudah berjalan.

**C. Halaman Profile dan Riwayat Laporan**

Pada detail riwayat laporan, tampilkan informasi lokasi yang tersimpan, meliputi:
- Alamat lokasi kerusakan.
- Latitude dan longitude.
- Pratinjau peta dengan marker lokasi laporan.

Jangan mengubah desain utama halaman Profile maupun struktur navigasi yang sudah ada.

### 7. Integrasi Data Laporan

Pastikan informasi lokasi terintegrasi dengan proses penyimpanan laporan.

Ketentuan:
- Simpan latitude dan longitude bersama data laporan.
- Simpan alamat hasil Reverse Geocoding.
- Pastikan informasi lokasi terhubung dengan laporan yang benar.
- Sesuaikan integrasi dengan struktur database dan API backend yang sudah digunakan.
- Jangan membuat database atau backend baru apabila sistem yang tersedia masih dapat digunakan.
- Periksa endpoint yang tersedia sebelum melakukan request.
- Tangani respons API, kegagalan koneksi, dan kesalahan endpoint dengan benar.
- Jangan menghilangkan data laporan lama.

### 8. Batasan Pengembangan (WAJIB DIPATUHI)

1. Gunakan React Native sesuai teknologi project yang sudah tersedia.
2. Jangan membuat project atau aplikasi baru.
3. Jangan mengubah nama aplikasi, package name, maupun konfigurasi utama.
4. Jangan mengganti Expo menjadi React Native CLI atau sebaliknya.
5. Jangan mengubah halaman Login, Register, Dashboard, Profile, dan navigasi yang tidak berkaitan dengan kebutuhan fitur.
6. Jangan mengubah desain UI yang sudah ada selain penambahan komponen lokasi yang diperlukan.
7. Jangan menghapus, menimpa, atau merusak fungsi yang sudah berjalan.
8. Jangan melakukan refactoring besar-besaran.
9. Jangan mengganti library yang sudah digunakan tanpa alasan teknis yang jelas.
10. Periksa dependensi sebelum memasang library tambahan.
11. Jangan membuat file baru jika fungsi masih dapat diintegrasikan secara wajar ke dalam file yang tersedia.
12. Jangan menggunakan data dummy sebagai pengganti GPS, Maps, Reverse Geocoding, dan Geofencing.
13. Jangan mengubah endpoint API atau struktur database tanpa memeriksa implementasi backend terlebih dahulu.
14. Batasi perubahan hanya pada bagian yang benar-benar diperlukan untuk pengembangan fitur lokasi.

### 9. Pengujian dan Verifikasi

Setelah implementasi selesai, lakukan pemeriksaan berikut:

- Permission lokasi dapat diminta dan ditangani dengan benar.
- GPS berhasil mengambil latitude, longitude, dan accuracy.
- Peta berhasil ditampilkan.
- Marker menunjukkan posisi lokasi pengguna.
- Posisi marker dapat diperbarui.
- Reverse Geocoding berhasil menghasilkan alamat.
- Geofencing dapat mendeteksi kondisi pengguna di dalam dan di luar area.
- Informasi lokasi dapat diintegrasikan dengan data laporan.
- Detail riwayat laporan dapat menampilkan lokasi yang tersimpan.
- Aplikasi dapat dijalankan tanpa error.
- Seluruh fitur KampusCare yang sudah ada tetap berjalan normal.

Jangan menyatakan fitur berhasil apabila belum benar-benar diuji. Jika terdapat keterbatasan API key, konfigurasi platform, permission, atau backend, jelaskan secara spesifik.

### 10. Laporan Hasil Implementasi

Setelah pengerjaan selesai, berikan laporan yang mencakup:

1. Ringkasan fitur yang berhasil diimplementasikan.
2. Daftar file yang dimodifikasi atau ditambahkan beserta fungsinya.
3. Library atau dependensi tambahan jika ada.
4. Konfigurasi permission dan API key yang diperlukan.
5. Perubahan integrasi frontend dan backend jika ada.
6. Langkah menjalankan dan menguji fitur.
7. Kendala atau bagian yang masih membutuhkan konfigurasi tambahan.

**PRIORITAS UTAMA: Kembangkan fitur Location-Based Services secara fungsional pada aplikasi KampusCare menggunakan React Native. Pertahankan desain, struktur, navigasi, dan seluruh fitur lama. Jangan membuat aplikasi baru, jangan melakukan perubahan yang tidak diperlukan, dan jangan hanya menghasilkan tampilan UI tanpa implementasi fungsi sebenarnya.**