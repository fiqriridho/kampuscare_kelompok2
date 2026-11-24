import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { isRunningInExpoGo } from 'expo';
import { API_ENDPOINTS } from '../constants/api';
import { apiClient } from './apiClient';

export const NOTIFICATION_CHANNELS = {
  REPORT_STATUS: 'report-status',
  NEW_REPORT: 'new-report',
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let registeredPushToken = null;
let registrationPromise = null;

const getProjectId = () =>
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() ||
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId;

async function createNotificationChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.REPORT_STATUS, {
    name: 'Status Laporan',
    importance: AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.NEW_REPORT, {
    name: 'Laporan Baru',
    importance: AndroidImportance.HIGH,
  });
}

async function registerDevice() {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  const isAndroidExpoGo = Platform.OS === 'android' && isRunningInExpoGo();
  if (!isAndroidExpoGo) {
    await createNotificationChannels();
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }

  if (status !== 'granted') {
    return null;
  }

  if (isAndroidExpoGo) {
    console.warn(
      'Push notification remote tidak tersedia di Expo Go Android. Gunakan development build.'
    );
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn(
      'Push notification tidak didaftarkan: EAS projectId tidak ditemukan. Atur extra.eas.projectId di app.json atau EXPO_PUBLIC_EAS_PROJECT_ID.'
    );
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await apiClient.post(API_ENDPOINTS.PUSH_TOKEN, { token });
  registeredPushToken = token;
  return token;
}

export async function registerDeviceForNotifications() {
  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = registerDevice();
  try {
    return await registrationPromise;
  } finally {
    registrationPromise = null;
  }
}

export async function unregisterDeviceForNotifications() {
  if (registrationPromise) {
    await registrationPromise;
  }

  if (!registeredPushToken) {
    return false;
  }

  await apiClient.delete(API_ENDPOINTS.PUSH_TOKEN, { token: registeredPushToken });
  registeredPushToken = null;
  return true;
}

export async function scheduleReportSuccessNotification(reportId) {
  if (Platform.OS === 'web') {
    return null;
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }

  if (status !== 'granted') {
    throw new Error('Izin notifikasi diperlukan untuk menampilkan notifikasi laporan.');
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Laporan Berhasil Dikirim',
      body: 'Ketuk untuk melihat detail laporan Anda.',
      data: { screen: 'ReportDetail', id: reportId },
    },
    trigger: null,
  });
}
