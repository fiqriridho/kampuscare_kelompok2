import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * ============================================================================
 * KONFIGURASI API & BASE URL BACKEND KAMPUSCARE
 * ============================================================================
 * Mendeteksi base URL backend secara dinamis dan cerdas untuk berbagai platform:
 * - Web Browser       : http://localhost:3000 (atau IP lokal)
 * - HP Android Fisik  : Otomatis mendeteksi IP Wi-Fi host Metro (e.g. http://172.16.42.42:3000)
 * - Android Emulator  : http://10.0.2.2:3000 (alias localhost host machine di AVD)
 * ============================================================================
 */

/**
 * Mengambil IP host dari Metro Bundler saat berjalan di Expo Go / Development
 */
const getMetroHostIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return null;
};

export const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const cleanEnvUrl = envUrl && typeof envUrl === 'string' ? envUrl.trim().replace(/\/+$/, '') : '';

  // 1. Pada platform Web (Browser di PC / Laptop)
  if (Platform.OS === 'web') {
    if (cleanEnvUrl) {
      return cleanEnvUrl;
    }
    return 'http://localhost:3000';
  }

  // 2. Pada platform Native (Android & iOS)
  // PERHATIKAN: 'localhost' atau '127.0.0.1' di perangkat native merujuk ke ponsel itu sendiri.
  // Jika EXPO_PUBLIC_API_URL diatur ke localhost, kita konversikan secara cerdas ke IP laptop/PC.
  const isLocalhostEnv =
    cleanEnvUrl.includes('localhost') || cleanEnvUrl.includes('127.0.0.1');

  if (cleanEnvUrl && !isLocalhostEnv) {
    // Pengguna telah menetapkan IP spesifik (contoh: http://172.16.42.42:3000)
    return cleanEnvUrl;
  }

  // Coba ambil IP host Wi-Fi dari Metro bundler (cocok untuk Expo Go di HP fisik)
  const metroIp = getMetroHostIp();
  if (metroIp) {
    // Ambil port dari cleanEnvUrl jika ada, atau default ke 3000
    const portMatch = cleanEnvUrl.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : '3000';
    return `http://${metroIp}:${port}`;
  }

  // Fallback jika di Android Emulator (AVD)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  // Fallback default
  return cleanEnvUrl || 'http://localhost:3000';
};

/**
 * Daftar Endpoint REST API Backend KampusCare
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
  ROOMS: '/api/rooms',
};
