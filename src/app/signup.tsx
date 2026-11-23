import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../context/AuthContext";
import { styles } from "../style/UIstyles";

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isReady, storageError, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSignup = async () => {
    if (!isReady || storageError) {
      setError(storageError || "Penyimpanan akun sedang dimuat. Coba lagi.");
      return;
    }
    const normalizedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      setSuccess(false);
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError("Format email tidak valid.");
      setSuccess(false);
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setSuccess(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      setSuccess(false);
      return;
    }
    try {
      if (!(await signUp(normalizedEmail, password))) {
        setError("Email sudah terdaftar. Silakan login.");
        setSuccess(false);
        return;
      }
    } catch {
      setError("Akun gagal disimpan. Periksa penyimpanan perangkat lalu coba lagi.");
      setSuccess(false);
      return;
    }

    setError("");
    setSuccess(true);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.loginKeyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.signupScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginCard}>
            <View style={styles.loginBrandMark}>
              <Text style={styles.loginBrandMarkText}>K</Text>
            </View>

            <Text style={styles.loginTitle}>Buat Akun</Text>
            <Text style={styles.loginSubtitle}>
              Daftar untuk mulai menggunakan KampusCare
            </Text>

            <View style={styles.loginForm}>
              <View style={styles.loginFormGroup}>
                <Text style={styles.loginLabel}>Email</Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError("");
                    setSuccess(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.loginFormGroup}>
                <Text style={styles.loginLabel}>Password</Text>
                <View style={styles.loginPasswordWrapper}>
                  <TextInput
                    style={styles.loginPasswordInput}
                    placeholder="Minimal 6 karakter"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError("");
                      setSuccess(false);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    style={styles.loginPasswordToggle}
                    onPress={() => setShowPassword((visible) => !visible)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    <Text style={styles.loginPasswordToggleText}>
                      {showPassword ? "Sembunyikan" : "Tampilkan"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.loginFormGroup}>
                <Text style={styles.loginLabel}>Konfirmasi Password</Text>
                <TextInput
                  style={styles.loginInput}
                  placeholder="Ulangi password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (error) setError("");
                    setSuccess(false);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
              </View>

              {error ? (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              ) : null}
              {storageError ? (
                <View style={styles.loginErrorContainer}>
                  <Text style={styles.loginErrorText}>{storageError}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.signupSuccessContainer}>
                  <Text style={styles.signupSuccessText}>
                    Akun berhasil dibuat. Silakan login dengan akun baru.
                  </Text>
                </View>
              ) : null}

              {success ? (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.replace("/login")}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Text style={styles.loginButtonText}>Login sekarang</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSignup}
                  disabled={!isReady || Boolean(storageError)}
                  accessibilityState={{ disabled: !isReady || Boolean(storageError) }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Daftar"
                >
                  <Text style={styles.loginButtonText}>Daftar</Text>
                </TouchableOpacity>
              )}

              <View style={styles.loginSignupRow}>
                <Text style={styles.loginSignupText}>Sudah punya akun?</Text>
                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  accessibilityRole="button"
                >
                  <Text style={styles.loginSignupLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
