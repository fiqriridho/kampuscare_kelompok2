import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  SECURE_TOKEN_KEY,
  ASYNC_PROFILE_KEY,
  ASYNC_HISTORY_KEY,
} from '../constants/storage';
import {
  INITIAL_MOCK_USERS,
  INITIAL_REPORTS_HISTORY,
} from '../constants/mockData';

// ============================================================================
// HELPER SECURE STORE (ANDROID & IOS NATIVE) & IN-MEMORY WEB FALLBACK
// ============================================================================
// In-memory fallback token KHUSUS untuk Expo Web (Development & Demo saja).
// Menggunakan variabel memori runtime murni (bukan localStorage/AsyncStorage)
// untuk memastikan token tidak disimpan ke penyimpanan tidak aman.
let webSessionToken = null;

export const saveAuthToken = async (token) => {
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
    console.error('Gagal menyimpan token ke SecureStore', error);
  }
};

export const getAuthToken = async () => {
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
    console.error('Gagal mengambil token dari SecureStore', error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      }
    }
    webSessionToken = null;
  } catch (error) {
    console.error('Gagal menghapus token dari SecureStore', error);
  }
};

export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ============================================================================
// CUSTOM HOOK: useAuth
// ============================================================================
export const useAuth = () => {
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

  // ----------------------------------------------------
  // 1. VALIDASI SESI: OTENTIKASI BERGANTUNG PADA SESSION/TOKEN
  // ----------------------------------------------------
  // Aplikasi TIDAK menganggap user authenticated hanya karena data profile ada di AsyncStorage.
  // Status login WAJIB divalidasi dari ketersediaan session token di SecureStore.
  useEffect(() => {
    checkActiveSession();
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
      console.error('Error saat verifikasi sesi', error);
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
      console.error('Error saat proses autentikasi', err);
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
      console.error('Error saat proses pendaftaran', err);
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
        console.error('Error saat proses logout', error);
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
      console.error('Gagal menambahkan laporan', error);
    }
  };

  // Bantuan isi akun demo
  const handleFillDemoAccount = () => {
    setLoginEmail('mahasiswa@kampuscare.ac.id');
    setLoginPassword('password123');
    setAuthError('');
  };

  return {
    // Navigation & Auth States
    activeTab,
    setActiveTab,
    isAuthenticated,
    isLoadingSession,
    authMode,
    setAuthMode,
    authError,
    setAuthError,
    authSuccess,
    setAuthSuccess,
    isSubmitting,

    // Form States & Setters
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regName,
    setRegName,
    regNim,
    setRegNim,
    regMajor,
    setRegMajor,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regConfirmPassword,
    setRegConfirmPassword,

    // Data States
    userProfile,
    reportHistory,
    usersList,

    // Handlers
    checkActiveSession,
    handleLogin,
    handleRegister,
    handleLogout,
    handleCreateNewReport,
    handleFillDemoAccount,
    showAlert,
  };
};

export default useAuth;
