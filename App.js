import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from './src/hooks/useAuth';
import AuthScreen from './src/app/AuthScreen';
import HomeScreen from './src/app/HomeScreen';
import CameraScreen from './src/app/CameraScreen';
import ProfileScreen from './src/app/ProfileScreen';
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
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
    handleLogout,
    handleCreateNewReport,
    handleFillDemoAccount,
  } = useAuth();

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

  // ----------------------------------------------------
  // MAIN SCREENS (SETELAH TERAUTENTIKASI)
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Dynamic Screen View */}
      {activeTab === 'Home' && <HomeScreen userProfile={userProfile} />}
      {activeTab === 'Camera' && (
        <CameraScreen handleCreateNewReport={handleCreateNewReport} />
      )}
      {activeTab === 'Profile' && (
        <ProfileScreen
          userProfile={userProfile}
          reportHistory={reportHistory}
          handleLogout={handleLogout}
        />
      )}

      {/* Modern Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
