/**
 * ============================================================================
 * TEST INTEGRASI END-TO-END FRONTEND - BACKEND KAMPUSCARE
 * ============================================================================
 * Menjalankan pengujian otomatis untuk memverifikasi kontrak API dan integrasi:
 * 1. Health check API backend
 * 2. Autentikasi login dengan kredensial demo
 * 3. Pemulihan sesi profil (GET /api/auth/me) dengan Bearer token
 * 4. Pengambilan data ruangan terproteksi (GET /api/rooms) dengan Bearer token
 * 5. Logout dan blacklist token (memastikan token ditolak setelah logout)
 * 6. Penolakan akses unauthorized tanpa token atau token salah
 * ============================================================================
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function runIntegrationTests() {
  console.log('====================================================');
  console.log(`Menguji Integrasi Frontend - Backend di: ${API_BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message} - ${details}`);
      failed++;
    }
  }

  let authToken = null;

  try {
    // Test 1: Health Check
    const resHealth = await fetch(`${API_BASE_URL}/api/health`);
    const dataHealth = await resHealth.json();
    assert(
      resHealth.status === 200 && dataHealth.status === 'ok',
      '1. GET /api/health mengembalikan 200 OK & status "ok"',
      JSON.stringify(dataHealth)
    );

    // Test 2: Login dengan kredensial yang salah
    const resBadLogin = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mahasiswa@kampuscare.ac.id',
        password: 'passwordsalah123',
      }),
    });
    const dataBadLogin = await resBadLogin.json();
    assert(
      resBadLogin.status === 401 && dataBadLogin.error === 'Email atau password salah',
      '2. POST /api/auth/login dengan password salah ditolak dengan 401',
      JSON.stringify(dataBadLogin)
    );

    // Test 3: Login sukses dengan akun demo
    const resLogin = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mahasiswa@kampuscare.ac.id',
        password: 'password123',
      }),
    });
    const dataLogin = await resLogin.json();
    authToken = dataLogin.token;
    assert(
      resLogin.status === 200 &&
        typeof authToken === 'string' &&
        authToken.length > 20 &&
        dataLogin.user &&
        dataLogin.user.email === 'mahasiswa@kampuscare.ac.id',
      '3. POST /api/auth/login mengembalikan token JWT dan profil mahasiswa',
      JSON.stringify(dataLogin.user)
    );

    // Test 4: Pemulihan sesi (GET /api/auth/me) dengan token valid
    const resMe = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dataMe = await resMe.json();
    assert(
      resMe.status === 200 &&
        dataMe.user &&
        dataMe.user.email === 'mahasiswa@kampuscare.ac.id',
      '4. GET /api/auth/me dengan Bearer token memulihkan profil user (200 OK)',
      JSON.stringify(dataMe)
    );

    // Test 5: Pengambilan data ruangan tanpa token harus 401
    const resRoomsNoAuth = await fetch(`${API_BASE_URL}/api/rooms`);
    assert(
      resRoomsNoAuth.status === 401,
      '5. GET /api/rooms tanpa token ditolak (401 Unauthorized)'
    );

    // Test 6: Pengambilan data ruangan dengan Bearer token valid
    const resRooms = await fetch(`${API_BASE_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dataRooms = await resRooms.json();
    const isRoomsValid =
      resRooms.status === 200 &&
      Array.isArray(dataRooms) &&
      dataRooms.length === 4 &&
      dataRooms.every(
        (r) =>
          r.id &&
          r.name &&
          r.status &&
          typeof r.capacity === 'number' &&
          r.location &&
          Array.isArray(r.facilities)
      );
    assert(
      isRoomsValid,
      '6. GET /api/rooms dengan Bearer token mengembalikan 4 data ruangan lengkap',
      `Jumlah: ${Array.isArray(dataRooms) ? dataRooms.length : 0}`
    );

    // Test 7: Logout sisi backend (pencatatan token ke blacklist)
    const resLogout = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dataLogout = await resLogout.json();
    assert(
      resLogout.status === 200 && dataLogout.message === 'Logout berhasil',
      '7. POST /api/auth/logout dengan Bearer token berhasil (200 OK)',
      JSON.stringify(dataLogout)
    );

    // Test 8: Verifikasi blacklist - token yang telah logout ditolak mengakses protected endpoint
    const resRoomsAfterLogout = await fetch(`${API_BASE_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(
      resRoomsAfterLogout.status === 401,
      '8. Token yang telah di-logout ditolak oleh authMiddleware (401 Unauthorized Blacklisted)'
    );

    // ========================================================================
    // TEST 9 - 14: VERIFIKASI INTEGRASI TUGAS PERBAIKAN FASILITAS (WEEK 8)
    // ========================================================================

    // Test 9: Login sebagai Admin dan verifikasi role
    const resAdminLogin = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kampuscare.ac.id',
        password: 'admin123',
      }),
    });
    const dataAdminLogin = await resAdminLogin.json();
    const adminToken = dataAdminLogin.token;
    assert(
      resAdminLogin.status === 200 && dataAdminLogin.user?.role === 'admin',
      '9. Login admin mengembalikan role "admin" untuk akses tab Tugas Perbaikan',
      JSON.stringify(dataAdminLogin.user)
    );

    // Login ulang Mahasiswa untuk testing flow laporan
    const resMhsReLogin = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mahasiswa@kampuscare.ac.id',
        password: 'password123',
      }),
    });
    const dataMhsReLogin = await resMhsReLogin.json();
    const newMhsToken = dataMhsReLogin.token;

    // Test 10: Mahasiswa membuat laporan via multipart (POST /api/reports)
    const fdReport = new FormData();
    fdReport.append('title', 'Lampu Koridor Rusak');
    fdReport.append('description', 'Lampu kedip-kedip dan berisiko korsleting listrik');
    fdReport.append('location_detail', 'Gedung A Lantai 1 Koridor Barat');
    fdReport.append('latitude', '-7.921035');
    fdReport.append('longitude', '112.580098');
    fdReport.append('location_address', 'Gedung A, Universitas, Malang');
    fdReport.append('location_accuracy', '103');
    fdReport.append('is_inside_campus', 'true');
    const dummyBlob = new Blob(['sample-evidence-photo'], { type: 'image/jpeg' });
    fdReport.append('photo', dummyBlob, 'damage.jpg');

    const resCreateReport = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newMhsToken}` },
      body: fdReport,
    });
    const dataCreateReport = await resCreateReport.json();
    const createdId = dataCreateReport.data?.id;
    assert(
      resCreateReport.status === 201 &&
        dataCreateReport.data?.status === 'menunggu' &&
        createdId,
      '10. Mahasiswa berhasil POST laporan kerusakan dengan foto (status: menunggu)',
      JSON.stringify(dataCreateReport)
    );

    // Test 11: Admin melihat daftar tugas perbaikan (GET /api/reports)
    const resAdminReports = await fetch(`${API_BASE_URL}/api/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataAdminReports = await resAdminReports.json();
    assert(
      resAdminReports.status === 200 &&
        Array.isArray(dataAdminReports.data) &&
        dataAdminReports.data.some((r) => r.id === createdId),
      '11. Admin mengambil daftar seluruh laporan via GET /api/reports (200 OK)'
    );

    // Test 12: Admin mengubah status menjadi diproses (PATCH /api/reports/:id)
    const resProcess = await fetch(`${API_BASE_URL}/api/reports/${createdId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'diproses', note: 'Sedang dicek oleh teknisi PLN' }),
    });
    const dataProcess = await resProcess.json();
    assert(
      resProcess.status === 200 && dataProcess.data?.status === 'diproses',
      '12. Admin memperbarui status laporan menjadi "diproses" (200 OK)'
    );

    // Test 13: Admin upload foto bukti perbaikan (POST /api/reports/:id/evidence-photo)
    const fdEvidence = new FormData();
    fdEvidence.append('photo', dummyBlob, 'evidence_done.jpg');
    const resEvidence = await fetch(`${API_BASE_URL}/api/reports/${createdId}/evidence-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: fdEvidence,
    });
    const dataEvidence = await resEvidence.json();
    assert(
      resEvidence.status === 200 && typeof dataEvidence.evidence_photo_url === 'string',
      '13. Admin mengunggah foto bukti perbaikan (200 OK & URL tersimpan)'
    );

    // Test 14: Admin menyelesaikan laporan setelah bukti ada (PATCH /api/reports/:id -> selesai)
    const resComplete = await fetch(`${API_BASE_URL}/api/reports/${createdId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'selesai', note: 'Lampu baru telah dipasang' }),
    });
    const dataComplete = await resComplete.json();
    assert(
      resComplete.status === 200 && dataComplete.data?.status === 'selesai',
      '14. Admin menyelesaikan status menjadi "selesai" dengan bukti tersimpan (200 OK)'
    );

  } catch (error) {
    console.error('Terjadi kesalahan saat pengujian:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`HASIL TEST INTEGRASI: ${passed} LULUS, ${failed} GAGAL`);
  console.log('====================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runIntegrationTests();
