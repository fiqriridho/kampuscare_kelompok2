// ============================================================================
// MOCK DATA INITIALIZATION
// ============================================================================

export const mockClassrooms = [
  { id: '1', name: 'Lab Komputer 1', building: 'Gedung A', status: 'kosong', capacity: 40 },
  { id: '2', name: 'Ruang 204', building: 'Gedung B', status: 'digunakan', capacity: 35 },
  { id: '3', name: 'Auditorium Utama', building: 'Gedung Rektorat', status: 'kosong', capacity: 150 },
  { id: '4', name: 'Ruang 102', building: 'Gedung A', status: 'digunakan', capacity: 30 },
];

export const mockReports = [
  { id: '1', title: 'AC Mati & Bising', location: 'Lab Komputer 1', status: 'Diproses', date: '22 Sep 2026', votes: 14 },
  { id: '2', title: 'Proyektor Redup / Off', location: 'Ruang 204', status: 'Menunggu', date: '21 Sep 2026', votes: 9 },
  { id: '3', title: 'Kursi Patah (2 unit)', location: 'Ruang 102', status: 'Selesai', date: '19 Sep 2026', votes: 5 },
];

// Akun mock demo: disimpan di runtime memory state untuk verifikasi tanpa backend
// PERHATIKAN: Password TIDAK PERNAH dikirim ke AsyncStorage, SecureStore, ataupun localStorage
export const INITIAL_MOCK_USERS = [
  {
    email: 'mahasiswa@kampuscare.ac.id',
    password: 'password123',
    profile: {
      name: 'Fiqri Ridho F',
      nim: '202410370110167',
      major: 'Teknik Informatika',
      email: 'mahasiswa@kampuscare.ac.id',
      avatar: 'https://krs.umm.ac.id/Poto/2024/202410370110167.JPG',
    },
  },
];

export const INITIAL_REPORTS_HISTORY = [
  { id: '101', title: 'Pintu Toilet Rusak', location: 'Gedung B Lt. 2', status: 'Diproses', date: '15 Sep 2026' },
  { id: '102', title: 'Lampu SV Mati', location: 'Parkiran Timur', status: 'Selesai', date: '02 Sep 2026' },
];
