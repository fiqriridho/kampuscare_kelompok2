import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import StorageInfoBox from '../components/StorageInfoBox';

export default function AuthScreen({
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
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
  isSubmitting,
  handleLogin,
  handleRegister,
  handleFillDemoAccount,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // Breakpoint tablet/desktop

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
                {authMode === 'login' ? (
                  <LoginForm
                    loginEmail={loginEmail}
                    setLoginEmail={setLoginEmail}
                    loginPassword={loginPassword}
                    setLoginPassword={setLoginPassword}
                    isSubmitting={isSubmitting}
                    handleLogin={handleLogin}
                    handleFillDemoAccount={handleFillDemoAccount}
                  />
                ) : (
                  <RegisterForm
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
                    handleRegister={handleRegister}
                  />
                )}

                {/* Storage Architecture Info */}
                <StorageInfoBox />
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

                {authMode === 'login' ? (
                  <LoginForm
                    loginEmail={loginEmail}
                    setLoginEmail={setLoginEmail}
                    loginPassword={loginPassword}
                    setLoginPassword={setLoginPassword}
                    isSubmitting={isSubmitting}
                    handleLogin={handleLogin}
                    handleFillDemoAccount={handleFillDemoAccount}
                  />
                ) : (
                  <RegisterForm
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
                    handleRegister={handleRegister}
                  />
                )}
              </View>

              {/* Storage Architecture Info */}
              <StorageInfoBox />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
