import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  registerDeviceForNotifications,
  unregisterDeviceForNotifications,
} from '../services/notificationService';

export default function useNotifications({
  isAuthenticated,
  isLoadingSession,
  setActiveTab,
  setSelectedReportId,
  userRole,
}) {
  const registrationAttempted = useRef(false);
  const pendingNavigation = useRef(null);
  const lastResponseIdentifier = useRef(null);

  const navigateToNotification = useCallback((navigation) => {
    if (
      navigation.screen === 'ReportDetail' &&
      navigation.id !== undefined &&
      navigation.id !== null &&
      String(navigation.id).trim() !== ''
    ) {
      setSelectedReportId(String(navigation.id));
      setActiveTab('ReportDetail');
      return;
    }

    setActiveTab(getNotificationTab(navigation.screen, userRole));
  }, [setActiveTab, setSelectedReportId, userRole]);

  useEffect(() => {
    if (!isAuthenticated) {
      registrationAttempted.current = false;
      return;
    }

    if (isLoadingSession || registrationAttempted.current) {
      return;
    }

    registrationAttempted.current = true;
    registerDeviceForNotifications().catch((error) => {
      console.error('Gagal mendaftarkan perangkat untuk notifikasi:', error);
    });
  }, [isAuthenticated, isLoadingSession]);

  const handleNotificationResponse = useCallback((response) => {
    const notification = response?.notification;
    if (!notification) {
      return;
    }

    const identifier = notification.request?.identifier;
    if (identifier && identifier === lastResponseIdentifier.current) {
      return;
    }
    lastResponseIdentifier.current = identifier || null;

    const payload = notification.request?.content?.data;
    const data = payload && typeof payload === 'object' ? payload : {};
    pendingNavigation.current = { screen: data.screen, id: data.id };

    if (isAuthenticated && !isLoadingSession) {
      navigateToNotification(pendingNavigation.current);
      pendingNavigation.current = null;
      clearLastNotificationResponse();
    }
  }, [isAuthenticated, isLoadingSession, navigateToNotification]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    let isMounted = true;
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (isMounted && response) {
          handleNotificationResponse(response);
        }
      })
      .catch((error) => {
        console.error('Gagal membaca respons notifikasi terakhir:', error);
      });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  useEffect(() => {
    if (!isAuthenticated || isLoadingSession || !pendingNavigation.current) {
      return;
    }

    navigateToNotification(pendingNavigation.current);
    pendingNavigation.current = null;
    clearLastNotificationResponse();
  }, [isAuthenticated, isLoadingSession, navigateToNotification]);

  return useCallback(() => unregisterDeviceForNotifications(), []);
}

function clearLastNotificationResponse() {
  try {
    Notifications.clearLastNotificationResponse();
  } catch (error) {
    console.warn('Gagal membersihkan respons notifikasi:', error);
  }
}

function getNotificationTab(screen, userRole) {
  if (screen === 'Profile') {
    return 'Profile';
  }
  if (screen !== 'Reports') {
    return 'Home';
  }
  return userRole === 'admin' ? 'Reports' : 'Profile';
}
