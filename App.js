import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth, { getAuthToken } from './src/hooks/useAuth';
import useReports from './src/hooks/useReports';
import useNotifications from './src/hooks/useNotifications';
import { scheduleReportSuccessNotification } from './src/services/notificationService';
import ReportDetailScreen from './src/components/ReportDetailScreen';
import AuthScreen from './src/app/AuthScreen';
import HomeScreen from './src/app/HomeScreen';
import CameraScreen from './src/app/CameraScreen';
import ReportsScreen from './src/app/ReportsScreen';
import ProfileScreen from './src/app/ProfileScreen';
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);

  const {
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
    userProfile,
    reportHistory,
    handleLogin,
    handleRegister,
    handleLogout: handleAuthLogout,
    handleFillDemoAccount,
  } = useAuth();

  const unregisterNotifications = useNotifications({
    isAuthenticated,
    isLoadingSession,
    setActiveTab,
    setSelectedReportId,
    userRole: userProfile?.role,
  });

  const handleLogout = () =>
    handleAuthLogout(async () => {
      try {
        await unregisterNotifications();
      } catch (error) {
        console.warn('Gagal menghapus push token sebelum logout:', error);
      }
    });

  // Integrasi useReports hook untuk sinkronisasi REST API laporan
  const {
    reports,
    isLoadingReports,
    reportsError,
    isRefreshing,
    filterStatus,
    setFilterStatus,
    fetchReports,
    handleRefresh,
    createReport,
    updateReportStatus,
    uploadEvidencePhoto,
  } = useReports(userProfile);

  const createReportWithNotification = useCallback(async (reportDetails) => {
    const report = await createReport(reportDetails);
    scheduleReportSuccessNotification(report?.id).catch((error) => {
      console.warn('Laporan terkirim, tetapi notifikasi gagal dijadwalkan:', error);
    });
    return report;
  }, [createReport]);

  // Ambil token untuk preview foto authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getAuthToken().then(setAuthToken);
    } else {
      setAuthToken(null);
    }
  }, [isAuthenticated]);

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
  // AUTHENTICATION SCREEN (RESPONSIVE SPLIT / MOBILE)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authError={authError}
        setAuthError={setAuthError}
        authSuccess={authSuccess}
        setAuthSuccess={setAuthSuccess}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        regName={regName}
        setRegName={setRegName}
        regNim={regNim}
        setRegNim={setRegNim}
        regMajor={regMajor}
        setRegMajor={setRegMajor}
        regEmail={regEmail}
        setRegEmail={setRegEmail}
        regPassword={regPassword}
        setRegPassword={setRegPassword}
        regConfirmPassword={regConfirmPassword}
        setRegConfirmPassword={setRegConfirmPassword}
        isSubmitting={isSubmitting}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleFillDemoAccount={handleFillDemoAccount}
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={isCameraFullscreen ? [] : ['top', 'right', 'bottom', 'left']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
        hidden={isCameraFullscreen}
      />

      {/* Dynamic Screen View */}
      {activeTab === 'Home' && (
        <HomeScreen
          userProfile={userProfile}
          reports={reports}
          isLoadingReports={isLoadingReports}
          onNavigateReports={() => setActiveTab(userProfile?.role === 'admin' ? 'Reports' : 'Profile')}
        />
      )}
      {activeTab === 'Camera' && (
        <CameraScreen
          createReport={createReportWithNotification}
          onCameraFullscreenChange={setIsCameraFullscreen}
          onExitCamera={() => {
            setIsCameraFullscreen(false);
            setActiveTab('Home');
          }}
          onReportSubmitted={() => {
            setIsCameraFullscreen(false);
            fetchReports();
            setActiveTab('Profile');
          }}
        />
      )}
      {activeTab === 'Reports' && userProfile?.role === 'admin' && (
        <ReportsScreen
          reports={reports}
          isLoadingReports={isLoadingReports}
          reportsError={reportsError}
          isRefreshing={isRefreshing}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          handleRefresh={handleRefresh}
          updateReportStatus={updateReportStatus}
          uploadEvidencePhoto={uploadEvidencePhoto}
          userProfile={userProfile}
          authToken={authToken}
        />
      )}
      {activeTab === 'Profile' && (
        <ProfileScreen
          userProfile={userProfile}
          reportHistory={reports}
          isLoading={isLoadingReports}
          handleLogout={handleLogout}
          authToken={authToken}
        />
      )}
      {activeTab === 'ReportDetail' && selectedReportId && (
        <ReportDetailScreen
          key={selectedReportId}
          reportId={selectedReportId}
          onBack={() => {
            setSelectedReportId(null);
            setActiveTab('Home');
          }}
        />
      )}

      {/* Modern Bottom Navigation dengan dukungan Role Admin */}
      {!isCameraFullscreen && activeTab !== 'ReportDetail' && (
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userProfile?.role || 'mahasiswa'}
        />
      )}
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
});
