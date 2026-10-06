import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ============================================================================
// 1. STORAGE KEYS & ARCHITECTURE (PEMISAHAN DATA SECARA KETAT)
// ============================================================================
// • SecureStore  : HANYA untuk token/session otentikasi pada platform native (Android & iOS).
// • AsyncStorage : HANYA untuk data non-sensitif (user profile & riwayat pelaporan).
// • Password     : TIDAK PERNAH disimpan di AsyncStorage, SecureStore, localStorage, atau log.
// • Token        : TIDAK PERNAH disimpan di AsyncStorage atau localStorage.
// ============================================================================
const SECURE_TOKEN_KEY = 'kampuscare_auth_token';
const ASYNC_PROFILE_KEY = '@kampuscare_user_profile';
const ASYNC_HISTORY_KEY = '@kampuscare_report_history';

// In-memory fallback token KHUSUS untuk Expo Web (Development & Demo saja).
// Menggunakan variabel memori runtime murni (bukan localStorage/AsyncStorage)
// untuk memastikan token tidak disimpan ke penyimpanan tidak aman.
let webSessionToken = null;

// ============================================================================
// 2. HELPER SECURE STORE (ANDROID & IOS NATIVE) & IN-MEMORY WEB FALLBACK
// ============================================================================
const saveAuthToken = async (token) => {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
        return;
      }
    }
    // Fallback murni in-memory pada web development/demo (TIDAK menyentuh localStorage atau AsyncStorage)
    webSessionToken = token;
  } catch (error) {
    console.error('Gagal menyimpan token ke SecureStore');
  }
};

const getAuthToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      }
    }
    // Fallback murni in-memory pada web development/demo
    return webSessionToken;
  } catch (error) {
    console.error('Gagal mengambil token dari SecureStore');
    return null;
  }
};

const removeAuthToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      }
    }
    webSessionToken = null;
  } catch (error) {
    console.error('Gagal menghapus token dari SecureStore');
  }
};

// ============================================================================
// 3. API CONFIGURATION & STATUS MAPPER (TASK 03)
// ============================================================================
const ROOMS_API_URL = 'https://kampuscare-api.free.beeceptor.com/rooms';

/**
 * Mapping status ruang dari REST API sesuai spesifikasi Task 03:
 * empty       → Kosong
 * occupied    → Digunakan
 * upcoming    → Akan Digunakan
 * maintenance → Maintenance
 */
const mapRoomStatus = (status) => {
  const normalized = (status || '').toString().toLowerCase().trim();
  switch (normalized) {
    case 'empty':
      return {
        label: 'Kosong',
        bgColor: '#DCFCE7', // soft green
        textColor: '#166534', // dark green
      };
    case 'occupied':
      return {
        label: 'Digunakan',
        bgColor: '#FEE2E2', // soft red
        textColor: '#991B1B', // dark red
      };
    case 'upcoming':
      return {
        label: 'Akan Digunakan',
        bgColor: '#FEF3C7', // soft amber
        textColor: '#92400E', // dark amber
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        bgColor: '#F1F5F9', // soft slate
        textColor: '#475569', // slate
      };
    default:
      return {
        label: status || '-',
        bgColor: '#F3F4F6',
        textColor: '#374151',
      };
  }
};

const mockReports = [
  { id: '1', title: 'AC Mati & Bising', location: 'Lab Komputer 1', status: 'Diproses', date: '22 Sep 2026', votes: 14 },
  { id: '2', title: 'Proyektor Redup / Off', location: 'Ruang 204', status: 'Menunggu', date: '21 Sep 2026', votes: 9 },
  { id: '3', title: 'Kursi Patah (2 unit)', location: 'Ruang 102', status: 'Selesai', date: '19 Sep 2026', votes: 5 },
];

// Akun mock demo: disimpan di runtime memory state untuk verifikasi tanpa backend
// PERHATIKAN: Password TIDAK PERNAH dikirim ke AsyncStorage, SecureStore, ataupun localStorage
const INITIAL_MOCK_USERS = [
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

const INITIAL_REPORTS_HISTORY = [
  { id: '101', title: 'Pintu Toilet Rusak', location: 'Gedung B Lt. 2', status: 'Diproses', date: '15 Sep 2026' },
  { id: '102', title: 'Lampu SV Mati', location: 'Parkiran Timur', status: 'Selesai', date: '02 Sep 2026' },
];

export default function App() {
  // Window dimensions hook untuk responsive layout
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // Breakpoint tablet/desktop

  // Navigation & Authentication States
  const [activeTab, setActiveTab] = useState('Home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Auth UI States
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regMajor, setRegMajor] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // In-Memory user list untuk pencocokan kredensial tanpa networking/backend
  const [usersList, setUsersList] = useState(INITIAL_MOCK_USERS);

  // Non-sensitive App Data (Disinkronkan dengan AsyncStorage)
  const [userProfile, setUserProfile] = useState(INITIAL_MOCK_USERS[0].profile);
  const [reportHistory, setReportHistory] = useState(INITIAL_REPORTS_HISTORY);

  // API Rooms States (Task 03: fetch() -> response.json() -> React state)
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data ruang dari REST API
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    setRoomsError(null);
    try {
      const response = await fetch(ROOMS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error (${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        throw new Error('Format data ruangan tidak valid');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRoomsError(error.message || 'Gagal terhubung ke server');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(ROOMS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP Error (${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setRooms(data);
        setRoomsError(null);
      }
    } catch (error) {
      setRoomsError(error.message || 'Gagal terhubung ke server');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ----------------------------------------------------
  // 1. VALIDASI SESI: OTENTIKASI BERGANTUNG PADA SESSION/TOKEN
  // ----------------------------------------------------
  // Aplikasi TIDAK menganggap user authenticated hanya karena data profile ada di AsyncStorage.
  // Status login WAJIB divalidasi dari ketersediaan session token di SecureStore.
  useEffect(() => {
    checkActiveSession();
    fetchRooms();
  }, []);

  const checkActiveSession = async () => {
    try {
      setIsLoadingSession(true);

      // Langkah 1: Cek apakah token sesi ada di SecureStore (atau in-memory web)
      const token = await getAuthToken();

      // VALIDASI KRUSIAL: Jika token tidak ada / kosong, user TIDAK authenticated
      // meskipun data profil atau riwayat masih ada di AsyncStorage.
      if (!token || typeof token !== 'string' || token.trim() === '') {
        setIsAuthenticated(false);
        setIsLoadingSession(false);
        return;
      }

      // Langkah 2: Token valid ditemukan -> Ambil data non-sensitif dari AsyncStorage
      const storedProfile = await AsyncStorage.getItem(ASYNC_PROFILE_KEY);
      const storedHistory = await AsyncStorage.getItem(ASYNC_HISTORY_KEY);

      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
      if (storedHistory) {
        setReportHistory(JSON.parse(storedHistory));
      }

      // Set authenticated HANYA karena token sesi terverifikasi
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saat verifikasi sesi');
      setIsAuthenticated(false);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // ----------------------------------------------------
  // 2. LOGIKA LOGIN & VALIDASI
  // ----------------------------------------------------
  const handleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');

    const emailTrimmed = loginEmail.trim();
    const passwordTrimmed = loginPassword.trim();

    // Validasi 1: Input Kosong
    if (!emailTrimmed || !passwordTrimmed) {
      setAuthError('Email dan kata sandi wajib diisi!');
      return;
    }

    // Validasi 2: Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setAuthError('Format email tidak valid (contoh: user@kampuscare.ac.id)!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validasi 3: Pencocokan Mock Credentials (In-Memory Runtime)
      const user = usersList.find(
        (u) =>
          u.email.toLowerCase() === emailTrimmed.toLowerCase() &&
          u.password === passwordTrimmed
      );

      if (!user) {
        setAuthError('Email atau kata sandi salah. Silakan periksa kembali!');
        setIsSubmitting(false);
        return;
      }

      // Credential Benar -> Buat Mock Session Token
      const mockSessionToken = `kc_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 1. Simpan token ke SecureStore (pada native) atau in-memory (web demo)
      // JANGAN menyimpan token ke AsyncStorage atau localStorage
      await saveAuthToken(mockSessionToken);

      // 2. Simpan HANYA data profil non-sensitif ke AsyncStorage (Password TIDAK disimpan)
      await AsyncStorage.setItem(ASYNC_PROFILE_KEY, JSON.stringify(user.profile));

      // 3. Pastikan history pelaporan ada di AsyncStorage
      const storedHistory = await AsyncStorage.getItem(ASYNC_HISTORY_KEY);
      if (!storedHistory) {
        await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify(INITIAL_REPORTS_HISTORY));
        setReportHistory(INITIAL_REPORTS_HISTORY);
      } else {
        setReportHistory(JSON.parse(storedHistory));
      }

      // Update state aplikasi (authenticated bergantung pada token)
      setUserProfile(user.profile);
      setIsAuthenticated(true);
      setActiveTab('Home');

      // Reset form login
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      console.error('Error saat proses autentikasi');
      setAuthError('Terjadi kesalahan saat masuk. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 3. LOGIKA REGISTER & VALIDASI
  // ----------------------------------------------------
  const handleRegister = async () => {
    setAuthError('');
    setAuthSuccess('');

    const nameTrimmed = regName.trim();
    const nimTrimmed = regNim.trim();
    const majorTrimmed = regMajor.trim();
    const emailTrimmed = regEmail.trim();
    const passwordTrimmed = regPassword.trim();
    const confirmPasswordTrimmed = regConfirmPassword.trim();

    // Validasi 1: Input Kosong
    if (
      !nameTrimmed ||
      !nimTrimmed ||
      !majorTrimmed ||
      !emailTrimmed ||
      !passwordTrimmed ||
      !confirmPasswordTrimmed
    ) {
      setAuthError('Semua kolom pendaftaran wajib diisi!');
      return;
    }

    // Validasi 2: Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setAuthError('Format email tidak valid (contoh: nama@kampuscare.ac.id)!');
      return;
    }

    // Validasi 3: Panjang Kata Sandi Minimal 6 Karakter
    if (passwordTrimmed.length < 6) {
      setAuthError('Kata sandi harus memiliki minimal 6 karakter!');
      return;
    }

    // Validasi 4: Konfirmasi Kata Sandi
    if (passwordTrimmed !== confirmPasswordTrimmed) {
      setAuthError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    // Validasi 5: Cek apakah email sudah terdaftar
    const existing = usersList.find(
      (u) => u.email.toLowerCase() === emailTrimmed.toLowerCase()
    );
    if (existing) {
      setAuthError('Email ini sudah terdaftar. Silakan langsung masuk!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Data profil non-sensitif (SAMA SEKALI TANPA PASSWORD)
      const newProfile = {
        name: nameTrimmed,
        nim: nimTrimmed,
        major: majorTrimmed,
        email: emailTrimmed.toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };

      // Simpan data akun di memory runtime state HANYA untuk verifikasi sesi tanpa backend
      // Password TIDAK disimpan ke AsyncStorage, SecureStore, ataupun localStorage
      setUsersList((prev) => [
        ...prev,
        {
          email: emailTrimmed.toLowerCase(),
          password: passwordTrimmed,
          profile: newProfile,
        },
      ]);

      // Buat token autentikasi mock
      const mockSessionToken = `kc_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 1. Simpan session token ke SecureStore (native)
      await saveAuthToken(mockSessionToken);

      // 2. Simpan profil non-sensitif ke AsyncStorage
      await AsyncStorage.setItem(ASYNC_PROFILE_KEY, JSON.stringify(newProfile));

      // 3. Inisialisasi riwayat pelaporan kosong untuk user baru di AsyncStorage
      await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify([]));
      setReportHistory([]);

      setUserProfile(newProfile);
      setIsAuthenticated(true);
      setActiveTab('Home');

      // Reset form registrasi
      setRegName('');
      setRegNim('');
      setRegMajor('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');

      showAlert('Registrasi Berhasil', `Selamat datang di KampusCare, ${newProfile.name}!`);
    } catch (err) {
      console.error('Error saat proses pendaftaran');
      setAuthError('Gagal melakukan pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // 4. LOGIKA LOGOUT: HAPUS TOKEN DARI SECURESTORE & RESET SESSION
  // ----------------------------------------------------
  const handleLogout = async () => {
    const performLogoutAction = async () => {
      try {
        // 1. Hapus token sesi dari SecureStore (dan reset in-memory web token)
        await removeAuthToken();

        // 2. Reset authentication state pada aplikasi
        setIsAuthenticated(false);
        setActiveTab('Home');
        setAuthMode('login');
        setAuthError('');
        setAuthSuccess('');

        showAlert('Logout Berhasil', 'Token sesi Anda telah dihapus.');
      } catch (error) {
        console.error('Error saat proses logout');
      }
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar dari akun KampusCare?');
      if (confirmLogout) {
        await performLogoutAction();
      }
    } else {
      Alert.alert(
        'Konfirmasi Logout',
        'Apakah Anda yakin ingin keluar dari akun KampusCare?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: performLogoutAction,
          },
        ]
      );
    }
  };

  // ----------------------------------------------------
  // 5. FITUR SIMULASI TAMBAH LAPORAN (ASYNCSTORAGE)
  // ----------------------------------------------------
  const handleCreateNewReport = async () => {
    try {
      const newReportItem = {
        id: Date.now().toString(),
        title: 'Kerusakan Fasilitas Kampus',
        location: 'Gedung Kuliah Bersama',
        status: 'Diproses',
        date: 'Hari ini',
      };

      const updatedHistory = [newReportItem, ...reportHistory];
      setReportHistory(updatedHistory);

      // Simpan riwayat non-sensitif ke AsyncStorage
      await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify(updatedHistory));

      showAlert(
        'Laporan Terkirim! 📸',
        'Laporan kerusakan berhasil dibuat dan tersimpan ke Local Storage (AsyncStorage).'
      );
    } catch (error) {
      console.error('Gagal menambahkan laporan');
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Bantuan isi akun demo
  const handleFillDemoAccount = () => {
    setLoginEmail('mahasiswa@kampuscare.ac.id');
    setLoginPassword('password123');
    setAuthError('');
  };

  // ----------------------------------------------------
  // FORM COMPONENTS (SHARED)
  // ----------------------------------------------------
  const renderLoginForm = () => (
    <View style={styles.formInnerContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Kampus</Text>
        <TextInput
          style={styles.textInput}
          placeholder="mahasiswa@kampuscare.ac.id"
          placeholderTextColor="#94A3B8"
          value={loginEmail}
          onChangeText={setLoginEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kata Sandi</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Masukkan kata sandi Anda"
          placeholderTextColor="#94A3B8"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Masuk ke KampusCare</Text>
        )}
      </TouchableOpacity>

      {/* Demo Credentials Helper */}
      <View style={styles.demoBox}>
        <View style={styles.demoHeaderRow}>
          <Text style={styles.demoTitle}>💡 Kredensial Mock Demo:</Text>
          <TouchableOpacity onPress={handleFillDemoAccount}>
            <Text style={styles.demoFillLink}>Gunakan Otomatis</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.demoText}>Email: mahasiswa@kampuscare.ac.id</Text>
        <Text style={styles.demoText}>Kata Sandi: password123</Text>
      </View>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formInnerContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nama Lengkap</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Contoh: Fiqri Ridho"
          placeholderTextColor="#94A3B8"
          value={regName}
          onChangeText={setRegName}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>NIM</Text>
          <TextInput
            style={styles.textInput}
            placeholder="202410370110..."
            placeholderTextColor="#94A3B8"
            value={regNim}
            onChangeText={setRegNim}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Program Studi</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Informatika"
            placeholderTextColor="#94A3B8"
            value={regMajor}
            onChangeText={setRegMajor}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Kampus</Text>
        <TextInput
          style={styles.textInput}
          placeholder="nama@kampuscare.ac.id"
          placeholderTextColor="#94A3B8"
          value={regEmail}
          onChangeText={setRegEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kata Sandi (Minimal 6 Karakter)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Kombinasi huruf & angka"
          placeholderTextColor="#94A3B8"
          value={regPassword}
          onChangeText={setRegPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Konfirmasi Kata Sandi</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ulangi kata sandi"
          placeholderTextColor="#94A3B8"
          value={regConfirmPassword}
          onChangeText={setRegConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ----------------------------------------------------
  // LOADING SPLASH SCREEN SAAT MEMERIKSA SESI
  // ----------------------------------------------------
  if (isLoadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Memeriksa status sesi...</Text>
      </View>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATION SCREEN (RESPONSIVE SPLIT / SINGLE-COLUMN)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.authMasterScroll,
              isWide && styles.authMasterScrollWide,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isWide ? (
              // ============================================
              // LAYAR LEBAR (TABLET / DESKTOP): SPLIT-SCREEN
              // ============================================
              <View style={styles.splitCard}>
                {/* KOLOM KIRI: BRANDING & HIGHLIGHTS KAMPUSCARE */}
                <View style={styles.splitBrandSide}>
                  <View style={styles.brandDecorCircle1} />
                  <View style={styles.brandDecorCircle2} />

                  <View style={styles.brandTopContent}>
                    <View style={styles.brandLogoCircleWide}>
                      <Text style={styles.brandLogoIconWide}>🏫</Text>
                    </View>
                    <Text style={styles.splitBrandTitle}>KampusCare</Text>
                    <Text style={styles.splitBrandTagline}>
                      Sistem Pelayanan & Fasilitas Kampus Terpadu
                    </Text>

                    <View style={styles.brandFeatureList}>
                      <View style={styles.brandFeatureItem}>
                        <View style={styles.brandFeatureIconBox}>
                          <Text style={styles.brandFeatureEmoji}>🏢</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.brandFeatureTitle}>Status Ruang Kelas</Text>
                          <Text style={styles.brandFeatureDesc}>
                            Cek ketersediaan ruang kelas kosong secara real-time
                          </Text>
                        </View>
                      </View>

                      <View style={styles.brandFeatureItem}>
                        <View style={styles.brandFeatureIconBox}>
                          <Text style={styles.brandFeatureEmoji}>🛠️</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.brandFeatureTitle}>Laporan Fasilitas</Text>
                          <Text style={styles.brandFeatureDesc}>
                            Laporkan kendala sarana prasarana kampus dengan cepat
                          </Text>
                        </View>
                      </View>

                      <View style={styles.brandFeatureItem}>
                        <View style={styles.brandFeatureIconBox}>
                          <Text style={styles.brandFeatureEmoji}>🔒</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.brandFeatureTitle}>Keamanan Terenkripsi</Text>
                          <Text style={styles.brandFeatureDesc}>
                            Sesi dilindungi hardware-backed Expo SecureStore
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.brandBottomBadge}>
                    <Text style={styles.brandBottomBadgeText}>
                      🎓 Portal Akademik & Fasilitas Terpadu
                    </Text>
                  </View>
                </View>

                {/* KOLOM KANAN: FORM LOGIN & REGISTER */}
                <View style={styles.splitFormSide}>
                  {/* Mode Tab Switcher */}
                  <View style={styles.authTabContainer}>
                    <TouchableOpacity
                      style={[styles.authTabButton, authMode === 'login' && styles.authTabButtonActive]}
                      onPress={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.authTabText,
                          authMode === 'login' && styles.authTabTextActive,
                        ]}
                      >
                        Masuk (Login)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.authTabButton,
                        authMode === 'register' && styles.authTabButtonActive,
                      ]}
                      onPress={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.authTabText,
                          authMode === 'register' && styles.authTabTextActive,
                        ]}
                      >
                        Daftar Akun
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Header Form */}
                  <Text style={styles.authFormTitle}>
                    {authMode === 'login' ? 'Selamat Datang Kembali 👋' : 'Buat Akun Mahasiswa 🎓'}
                  </Text>
                  <Text style={styles.authFormSubtitle}>
                    {authMode === 'login'
                      ? 'Masuk menggunakan akun kampus Anda untuk melanjutkan'
                      : 'Lengkapi data diri untuk mengakses seluruh layanan kampus'}
                  </Text>

                  {/* Banner Pesan / Alert */}
                  {authError ? (
                    <View style={styles.authErrorCard}>
                      <Text style={styles.authErrorIcon}>⚠️</Text>
                      <Text style={styles.authErrorText}>{authError}</Text>
                    </View>
                  ) : null}

                  {authSuccess ? (
                    <View style={styles.authSuccessCard}>
                      <Text style={styles.authSuccessIcon}>✅</Text>
                      <Text style={styles.authSuccessText}>{authSuccess}</Text>
                    </View>
                  ) : null}

                  {/* Form Sesuai Tab Aktif */}
                  {authMode === 'login' ? renderLoginForm() : renderRegisterForm()}

                  {/* Storage Architecture Info */}
                  <View style={styles.storageInfoBox}>
                    <Text style={styles.storageInfoTitle}>Arsitektur Penyimpanan & Keamanan:</Text>
                    {Platform.OS !== 'web' ? (
                      <Text style={styles.storageInfoItem}>
                        🔐 <Text style={{ fontWeight: '700' }}>SecureStore (Native):</Text> Token sesi disimpan aman terenkripsi (Android Keystore / iOS Keychain)
                      </Text>
                    ) : (
                      <Text style={styles.storageInfoItem}>
                        💻 <Text style={{ fontWeight: '700' }}>Expo Web (Development/Demo):</Text> In-memory session (SecureStore hanya didukung pada platform native Android/iOS; token tidak disimpan di localStorage/AsyncStorage)
                      </Text>
                    )}
                    <Text style={styles.storageInfoItem}>
                      📁 <Text style={{ fontWeight: '700' }}>AsyncStorage:</Text> Profil & riwayat pelaporan (Data Non-Sensitif)
                    </Text>
                    <Text style={styles.storageInfoItem}>
                      🛡️ <Text style={{ fontWeight: '700' }}>Aturan Privasi:</Text> Password tidak pernah disimpan ke penyimpanan lokal ataupun log
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // ============================================
              // LAYAR KECIL (MOBILE): SINGLE-COLUMN LAYOUT
              // ============================================
              <View style={styles.mobileAuthContainer}>
                {/* Header Brand */}
                <View style={styles.authBrandHeader}>
                  <View style={styles.authLogoCircle}>
                    <Text style={styles.authLogoIcon}>🏫</Text>
                  </View>
                  <Text style={styles.authBrandTitle}>KampusCare</Text>
                  <Text style={styles.authBrandSubtitle}>
                    Sistem Pelayanan & Fasilitas Kampus Terpadu
                  </Text>
                </View>

                {/* Mode Tab Switcher */}
                <View style={styles.authTabContainer}>
                  <TouchableOpacity
                    style={[styles.authTabButton, authMode === 'login' && styles.authTabButtonActive]}
                    onPress={() => {
                      setAuthMode('login');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.authTabText,
                        authMode === 'login' && styles.authTabTextActive,
                      ]}
                    >
                      Masuk (Login)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.authTabButton,
                      authMode === 'register' && styles.authTabButtonActive,
                    ]}
                    onPress={() => {
                      setAuthMode('register');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.authTabText,
                        authMode === 'register' && styles.authTabTextActive,
                      ]}
                    >
                      Daftar Akun
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Banner Pesan / Alert */}
                {authError ? (
                  <View style={styles.authErrorCard}>
                    <Text style={styles.authErrorIcon}>⚠️</Text>
                    <Text style={styles.authErrorText}>{authError}</Text>
                  </View>
                ) : null}

                {authSuccess ? (
                  <View style={styles.authSuccessCard}>
                    <Text style={styles.authSuccessIcon}>✅</Text>
                    <Text style={styles.authSuccessText}>{authSuccess}</Text>
                  </View>
                ) : null}

                {/* Form Card */}
                <View style={styles.authFormCard}>
                  <Text style={styles.authFormTitle}>
                    {authMode === 'login' ? 'Selamat Datang Kembali 👋' : 'Buat Akun Mahasiswa 🎓'}
                  </Text>
                  <Text style={styles.authFormSubtitle}>
                    {authMode === 'login'
                      ? 'Masuk menggunakan akun kampus Anda'
                      : 'Lengkapi data diri untuk mengakses layanan kampus'}
                  </Text>

                  {authMode === 'login' ? renderLoginForm() : renderRegisterForm()}
                </View>

                {/* Storage Architecture Info */}
                <View style={styles.storageInfoBox}>
                  <Text style={styles.storageInfoTitle}>Arsitektur Penyimpanan & Keamanan:</Text>
                  {Platform.OS !== 'web' ? (
                    <Text style={styles.storageInfoItem}>
                      🔐 <Text style={{ fontWeight: '700' }}>SecureStore (Native):</Text> Token sesi disimpan aman terenkripsi (Android Keystore / iOS Keychain)
                    </Text>
                  ) : (
                    <Text style={styles.storageInfoItem}>
                      💻 <Text style={{ fontWeight: '700' }}>Expo Web (Development/Demo):</Text> In-memory session (SecureStore hanya didukung pada platform native Android/iOS; token tidak disimpan di localStorage/AsyncStorage)
                    </Text>
                  )}
                  <Text style={styles.storageInfoItem}>
                    📁 <Text style={{ fontWeight: '700' }}>AsyncStorage:</Text> Profil & riwayat pelaporan (Data Non-Sensitif)
                  </Text>
                  <Text style={styles.storageInfoItem}>
                    🛡️ <Text style={{ fontWeight: '700' }}>Aturan Privasi:</Text> Password tidak pernah disimpan ke penyimpanan lokal ataupun log
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // MAIN SCREENS (SETELAH TERAUTENTIKASI)
  // ----------------------------------------------------

  // HomeScreen Component
  const renderHome = () => (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#4F46E5']}
          tintColor="#4F46E5"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Halo, {userProfile.name} 👋</Text>
          <Text style={styles.brandTitle}>KampusCare</Text>
        </View>
        <Image source={{ uri: userProfile.avatar }} style={styles.headerAvatar} />
      </View>

      {/* Main Menu Shortcuts / Hero Cards */}
      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: '#4F46E5' }]}
          activeOpacity={0.8}
          onPress={fetchRooms}
        >
          <Text style={styles.menuIconText}>🏫</Text>
          <Text style={styles.menuCardTitle}>Ruang Kelas</Text>
          <Text style={styles.menuCardSubtitle}>Cek Status Ruangan Kosong</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuCard, { backgroundColor: '#0EA5E9' }]} activeOpacity={0.8}>
          <Text style={styles.menuIconText}>🛠️</Text>
          <Text style={styles.menuCardTitle}>Fasilitas & Laporan</Text>
          <Text style={styles.menuCardSubtitle}>Laporkan Kerusakan Kampus</Text>
        </TouchableOpacity>
      </View>

      {/* Status Ruang Kelas Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>
        <TouchableOpacity onPress={fetchRooms} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoadingRooms ? (
        <View style={styles.roomLoadingContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.roomLoadingText}>Memuat ketersediaan ruangan...</Text>
        </View>
      ) : roomsError ? (
        /* Error State + Retry */
        <View style={styles.roomErrorContainer}>
          <Text style={styles.roomErrorIcon}>⚠️</Text>
          <View style={styles.roomErrorTextContainer}>
            <Text style={styles.roomErrorTitle}>Gagal Memuat Data Ruangan</Text>
            <Text style={styles.roomErrorMessage}>{roomsError}</Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRooms}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <View style={styles.roomEmptyContainer}>
          <Text style={styles.roomEmptyIcon}>📭</Text>
          <Text style={styles.roomEmptyTitle}>Tidak Ada Data Ruangan</Text>
          <Text style={styles.roomEmptyText}>Saat ini belum ada data ruangan yang tersedia.</Text>
          <TouchableOpacity
            style={styles.emptyRetryButton}
            onPress={fetchRooms}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyRetryButtonText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Data Ruangan dari REST API */
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {rooms.map((item) => {
            const statusInfo = mapRoomStatus(item.status);
            return (
              <View key={item.id} style={styles.classroomCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusInfo.textColor },
                      ]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.roomBuilding}>📍 {item.location}</Text>
                <Text style={styles.roomCapacity}>Kapasitas: {item.capacity} Kursi</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Laporan Kerusakan Teratas */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Laporan Kerusakan Teratas</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {mockReports.map((report) => (
        <View key={report.id} style={styles.reportCard}>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportLocation}>📍 {report.location}</Text>
            <Text style={styles.reportDate}>📅 {report.date}</Text>
          </View>
          <View style={styles.reportBadgeContainer}>
            <View
              style={[
                styles.reportStatusBadge,
                report.status === 'Selesai'
                  ? styles.badgeSuccess
                  : report.status === 'Diproses'
                  ? styles.badgeWarning
                  : styles.badgeDanger,
              ]}
            >
              <Text style={styles.reportStatusText}>{report.status}</Text>
            </View>
            <Text style={styles.voteText}>👍 {report.votes}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // CameraScreen Component (Shortcut Pelaporan & Persistence ke AsyncStorage)
  const renderCamera = () => (
    <View style={styles.cameraScreenContainer}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraIcon}>📸</Text>
        <Text style={styles.cameraTitle}>Shortcut Laporan Kerusakan</Text>
        <Text style={styles.cameraSubtitle}>
          Arahkan kamera ke fasilitas yang rusak untuk membuat laporan secara cepat.
        </Text>
        <TouchableOpacity
          style={styles.captureButton}
          activeOpacity={0.8}
          onPress={handleCreateNewReport}
        >
          <Text style={styles.captureButtonText}>Ambil Foto & Buat Laporan</Text>
        </TouchableOpacity>
        <Text style={styles.cameraNote}>
          *Data laporan tersimpan ke Local Storage (AsyncStorage)
        </Text>
      </View>
    </View>
  );

  // ProfileScreen Component
  const renderProfile = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeaderCard}>
        <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatarLarge} />
        <Text style={styles.profileName}>{userProfile.name}</Text>
        <Text style={styles.profileNim}>NIM: {userProfile.nim}</Text>
        <Text style={styles.profileMajor}>{userProfile.major}</Text>
        {userProfile.email && (
          <Text style={styles.profileEmail}>✉️ {userProfile.email}</Text>
        )}

        {/* Status Penyimpanan Profile & Session */}
        <View style={styles.badgeProfileStorage}>
          <Text style={styles.badgeProfileStorageText}>
            ✓ Profil tersimpan di AsyncStorage (Non-Sensitif)
          </Text>
        </View>
        <View style={styles.badgeSessionStorage}>
          <Text style={styles.badgeSessionStorageText}>
            {Platform.OS !== 'web'
              ? '🔒 Sesi aktif terverifikasi dari Expo SecureStore'
              : '💻 Sesi aktif terverifikasi (In-Memory Web Demo)'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Riwayat Pelaporan Saya</Text>
        <Text style={styles.badgeCounterText}>{reportHistory.length} Laporan</Text>
      </View>

      {reportHistory.length === 0 ? (
        <View style={styles.emptyHistoryCard}>
          <Text style={styles.emptyHistoryIcon}>📝</Text>
          <Text style={styles.emptyHistoryText}>Belum ada riwayat laporan kerusakan.</Text>
          <Text style={styles.emptyHistorySubtext}>
            Gunakan tab Camera untuk membuat laporan pertama Anda.
          </Text>
        </View>
      ) : (
        reportHistory.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyLocation}>📍 {item.location}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <View
              style={[
                styles.reportStatusBadge,
                item.status === 'Selesai' ? styles.badgeSuccess : styles.badgeWarning,
              ]}
            >
              <Text style={styles.reportStatusText}>{item.status}</Text>
            </View>
          </View>
        ))
      )}

      {/* Tombol Logout: Menghapus token dari SecureStore */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Keluar / Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Dynamic Screen View */}
      {activeTab === 'Home' && renderHome()}
      {activeTab === 'Camera' && renderCamera()}
      {activeTab === 'Profile' && renderProfile()}

      {/* Modern Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Home')}
        >
          <Text style={[styles.navIcon, activeTab === 'Home' && styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'Home' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemCamera}
          onPress={() => setActiveTab('Camera')}
          activeOpacity={0.85}
        >
          <View style={styles.cameraNavCircle}>
            <Text style={styles.cameraNavIcon}>📷</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Camera' && styles.activeNavLabel, { marginTop: 4 }]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.navIcon, activeTab === 'Profile' && styles.activeNavIcon]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'Profile' && styles.activeNavLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  // ------------------------------------
  // RESPONSIVE AUTHENTICATION STYLES
  // ------------------------------------
  authSafeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  authMasterScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  authMasterScrollWide: {
    paddingHorizontal: 32,
    paddingVertical: 48,
  },

  // --- MOBILE SINGLE-COLUMN CONTAINER ---
  mobileAuthContainer: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  authBrandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  authLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  authLogoIcon: {
    fontSize: 30,
  },
  authBrandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  authBrandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

  // --- WIDE SCREEN (SPLIT-SCREEN) CARD ---
  splitCard: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 980,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  splitBrandSide: {
    width: '45%',
    backgroundColor: '#4F46E5',
    padding: 36,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  brandDecorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandDecorCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  brandTopContent: {
    zIndex: 1,
  },
  brandLogoCircleWide: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  brandLogoIconWide: {
    fontSize: 32,
  },
  splitBrandTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  splitBrandTagline: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 6,
    marginBottom: 32,
    lineHeight: 20,
  },
  brandFeatureList: {
    gap: 18,
  },
  brandFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandFeatureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  brandFeatureEmoji: {
    fontSize: 20,
  },
  brandFeatureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandFeatureDesc: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 2,
    lineHeight: 16,
  },
  brandBottomBadge: {
    zIndex: 1,
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  brandBottomBadgeText: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '500',
  },

  splitFormSide: {
    width: '55%',
    backgroundColor: '#FFFFFF',
    padding: 36,
    justifyContent: 'center',
  },

  // --- FORM ELEMENTS & TABS ---
  authTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  authTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authTabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  authTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  authTabTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  authFormCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },
  formInnerContainer: {
    width: '100%',
  },
  authFormTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  authFormSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  authErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  authErrorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  authErrorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  authSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  authSuccessIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  authSuccessText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  demoBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  demoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3730A3',
  },
  demoFillLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  demoText: {
    fontSize: 12,
    color: '#4338CA',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  storageInfoBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },
  storageInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  storageInfoItem: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 18,
  },

  // ------------------------------------
  // MAIN APP STYLES (ORIGINAL)
  // ------------------------------------
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  badgeCounterText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  menuCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuIconText: {
    fontSize: 28,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  menuCardSubtitle: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  classroomCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roomBuilding: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 12,
    color: '#94A3B8',
  },
  roomLoadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    minHeight: 110,
    gap: 8,
  },
  roomLoadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  roomErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 12,
  },
  roomErrorIcon: {
    fontSize: 24,
  },
  roomErrorTextContainer: {
    flex: 1,
  },
  roomErrorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  roomErrorMessage: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roomEmptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    minHeight: 110,
  },
  roomEmptyIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  roomEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  roomEmptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyRetryButton: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportLocation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  reportBadgeContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  reportStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  voteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  cameraScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cameraPlaceholder: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cameraIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  captureButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cameraNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileAvatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileNim: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  profileMajor: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  badgeProfileStorage: {
    marginTop: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeProfileStorageText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  badgeSessionStorage: {
    marginTop: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeSessionStorageText: {
    fontSize: 11,
    color: '#3730A3',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyLocation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyHistoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyHistoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptyHistorySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemCamera: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    top: -14,
  },
  cameraNavCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cameraNavIcon: {
    fontSize: 24,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  activeNavIcon: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
