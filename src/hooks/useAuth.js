import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  SECURE_TOKEN_KEY,
  ASYNC_PROFILE_KEY,
  ASYNC_HISTORY_KEY,
} from '../constants/storage';
import { INITIAL_REPORTS_HISTORY } from '../constants/mockData';
import { getApiBaseUrl, API_ENDPOINTS } from '../constants/api';
import saveReportPhoto from '../utils/saveReportPhoto';
import authHandler from '../services/authHandler';

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

  // Non-sensitive App Data (Disinkronkan dengan AsyncStorage)
  const [userProfile, setUserProfile] = useState(null);
  const [reportHistory, setReportHistory] = useState(INITIAL_REPORTS_HISTORY);

  // ----------------------------------------------------
  // 1. VALIDASI SESI: OTENTIKASI BERGANTUNG PADA SESSION/TOKEN
  // ----------------------------------------------------
  // Aplikasi TIDAK menganggap user authenticated hanya karena data profile ada di AsyncStorage.
  // Status login WAJIB divalidasi dari ketersediaan session token di SecureStore.
  useEffect(() => {
    checkActiveSession();

    // Subscribe ke event 401 Unauthorized terpusat
    const unsubscribe401 = authHandler.on401(async () => {
      console.warn('Menerima event 401 Unauthorized: Sesi kedaluwarsa, membersihkan auth state.');
      await removeAuthToken();
      setIsAuthenticated(false);
    });

    return () => {
      unsubscribe401();
    };
  }, []);

  const checkActiveSession = async () => {
    try {
      setIsLoadingSession(true);

      // Langkah 1: Cek apakah token sesi ada di SecureStore (atau in-memory web)
      const token = await getAuthToken();

      // VALIDASI KRUSIAL: Jika token tidak ada / kosong, user TIDAK authenticated
      if (!token || typeof token !== 'string' || token.trim() === '') {
        setIsAuthenticated(false);
        setIsLoadingSession(false);
        return;
      }

      // Langkah 2: Verifikasi token ke endpoint backend (GET /api/auth/me)
      const baseUrl = getApiBaseUrl();
      try {
        const response = await fetch(`${baseUrl}${API_ENDPOINTS.ME}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setUserProfile(data.user);
            await AsyncStorage.setItem(ASYNC_PROFILE_KEY, JSON.stringify(data.user));
          }
          const storedHistory = await AsyncStorage.getItem(ASYNC_HISTORY_KEY);
          if (storedHistory) {
            setReportHistory(JSON.parse(storedHistory));
          }
          setIsAuthenticated(true);
          return;
        }

        // Jika backend menolak token (401 Unauthorized / Token Expired / Blacklisted)
        if (response.status === 401 || response.status === 403 || response.status === 404) {
          console.warn('Sesi tidak valid atau telah kedaluwarsa di backend (401). Membersihkan token.');
          await removeAuthToken();
          setIsAuthenticated(false);
          return;
        }
      } catch (netErr) {
        // Jika server backend offline saat startup, gunakan cache offline jika token ada
        console.warn('Tidak dapat menghubungi server auth saat ini, menggunakan cache:', netErr);
        const storedProfile = await AsyncStorage.getItem(ASYNC_PROFILE_KEY);
        const storedHistory = await AsyncStorage.getItem(ASYNC_HISTORY_KEY);

        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
        if (storedHistory) {
          setReportHistory(JSON.parse(storedHistory));
        }
        setIsAuthenticated(true);
        return;
      }
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
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: emailTrimmed,
          password: passwordTrimmed,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.token) {
        // 1. Simpan token JWT ke SecureStore (native) atau in-memory (web)
        await saveAuthToken(data.token);

        // 2. Simpan profil user non-sensitif ke AsyncStorage
        const profile = data.user || {
          name: 'Mahasiswa',
          email: emailTrimmed,
          nim: '-',
          major: '-',
        };
        await AsyncStorage.setItem(ASYNC_PROFILE_KEY, JSON.stringify(profile));

        // 3. Pastikan history pelaporan ada di AsyncStorage
        const storedHistory = await AsyncStorage.getItem(ASYNC_HISTORY_KEY);
        if (!storedHistory) {
          await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify(INITIAL_REPORTS_HISTORY));
          setReportHistory(INITIAL_REPORTS_HISTORY);
        } else {
          setReportHistory(JSON.parse(storedHistory));
        }

        // Update state aplikasi
        setUserProfile(profile);
        setIsAuthenticated(true);
        setActiveTab('Home');

        // Reset form login
        setLoginEmail('');
        setLoginPassword('');
        return;
      }

      // Validasi Gagal dari backend (400 / 401)
      if (response.status === 400 || response.status === 401) {
        setAuthError(data.error || 'Email atau kata sandi salah. Silakan periksa kembali!');
        return;
      }

      setAuthError(data.error || `Terjadi kesalahan saat masuk (${response.status})`);
    } catch (err) {
      console.error('Error saat proses autentikasi', err);
      setAuthError(
        `Gagal terhubung ke server backend (${getApiBaseUrl()}). Pastikan server backend telah aktif.`
      );
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

    setIsSubmitting(true);

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: nameTrimmed,
          nim: nimTrimmed,
          major: majorTrimmed,
          email: emailTrimmed,
          password: passwordTrimmed,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setAuthError('Email atau NIM sudah terdaftar. Silakan langsung masuk!');
        return;
      }

      if (!response.ok || !data.token || !data.user) {
        setAuthError(data.error || `Pendaftaran gagal (${response.status})`);
        return;
      }

      // 1. Simpan token JWT dari backend ke SecureStore (native) / in-memory (web)
      await saveAuthToken(data.token);

      // 2. Simpan profil non-sensitif ke AsyncStorage
      await AsyncStorage.setItem(ASYNC_PROFILE_KEY, JSON.stringify(data.user));

      // 3. Inisialisasi riwayat pelaporan kosong untuk user baru
      await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify([]));
      setReportHistory([]);
      setUserProfile(data.user);
      setIsAuthenticated(true);
      setActiveTab('Home');

      // Reset form registrasi
      setRegName('');
      setRegNim('');
      setRegMajor('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');

      showAlert('Registrasi Berhasil', `Selamat datang di KampusCare, ${data.user.name}!`);
    } catch (err) {
      console.error('Error saat proses pendaftaran', err);
      setAuthError(
        `Gagal terhubung ke server backend (${getApiBaseUrl()}). Pastikan server backend telah aktif.`
      );
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
        const token = await getAuthToken();

        // 1. Panggil endpoint POST /api/auth/logout untuk mencabut token (Blacklist di backend)
        if (token) {
          try {
            const baseUrl = getApiBaseUrl();
            await fetch(`${baseUrl}${API_ENDPOINTS.LOGOUT}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            });
          } catch (logoutApiErr) {
            console.warn('Gagal memanggil endpoint logout backend:', logoutApiErr);
          }
        }

        // 2. Hapus token sesi dari SecureStore (dan reset in-memory web token)
        await removeAuthToken();

        // 3. Reset authentication state pada aplikasi
        setIsAuthenticated(false);
        setActiveTab('Home');
        setAuthMode('login');
        setAuthError('');
        setAuthSuccess('');

        showAlert('Logout Berhasil', 'Sesi telah ditutup dan token telah dicabut.');
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
  const handleCreateNewReport = async (photoUri, details = {}) => {
    try {
      const savedPhotoUri = photoUri ? await saveReportPhoto(photoUri) : null;
      const newReportItem = {
        id: Date.now().toString(),
        title: 'Kerusakan Fasilitas Kampus',
        location: details.location?.trim() || 'Belum ditentukan',
        location_detail: details.location?.trim() || 'Belum ditentukan',
        ...(details.latitude !== undefined && details.longitude !== undefined
          ? {
              latitude: details.latitude,
              longitude: details.longitude,
              location_address: details.locationAddress || details.location?.trim() || '',
              location_accuracy: details.locationAccuracy ?? null,
              is_inside_campus: details.isInsideCampus ?? null,
            }
          : {}),
        status: 'Diproses',
        date: 'Hari ini',
        ...(details.description?.trim()
          ? { description: details.description.trim() }
          : {}),
        ...(savedPhotoUri ? { photoUri: savedPhotoUri } : {}),
      };

      const updatedHistory = [newReportItem, ...reportHistory];

      // Simpan riwayat non-sensitif ke AsyncStorage
      await AsyncStorage.setItem(ASYNC_HISTORY_KEY, JSON.stringify(updatedHistory));
      setReportHistory(updatedHistory);

      showAlert(
        'Laporan Terkirim! 📸',
        'Laporan kerusakan, deskripsi, dan foto berhasil disimpan ke riwayat lokal (AsyncStorage).'
      );
      return true;
    } catch (error) {
      console.error('Gagal menambahkan laporan', error);
      showAlert(
        'Laporan Gagal Disimpan',
        'Laporan belum dapat disimpan. Periksa ruang penyimpanan perangkat, lalu coba lagi.'
      );
      return false;
    }
  };

  // Bantuan isi akun demo (Mahasiswa atau Admin)
  const handleFillDemoAccount = (role = 'mahasiswa') => {
    if (role === 'admin') {
      setLoginEmail('admin@kampuscare.ac.id');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('mahasiswa@kampuscare.ac.id');
      setLoginPassword('password123');
    }
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
