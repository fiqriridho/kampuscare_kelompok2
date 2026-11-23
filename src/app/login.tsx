import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../context/AuthContext";
import { styles } from "../style/UIstyles";

export default function Login() {
  const router = useRouter();
  const {
    isAuthenticated,
    isReady,
    storageError,
    lastRegisteredEmail,
    signIn,
  } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    if (!isReady || storageError) {
      setError(storageError || "Akun tersimpan sedang dimuat. Coba lagi.");
      return;
    }
    const normalizedEmail = (email ?? lastRegisteredEmail).trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    try {
      if (!(await signIn(normalizedEmail, password))) {
        setError("Email atau password salah, atau akun belum terdaftar.");
        return;
      }
    } catch {
      setError("Tidak dapat memeriksa akun tersimpan. Coba lagi.");
      return;
    }

    setError("");
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.loginKeyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.loginCard}>
          <View style={styles.loginBrandMark}>
            <Text style={styles.loginBrandMarkText}>K</Text>
          </View>

          <Text style={styles.loginTitle}>Selamat Datang Kembali</Text>
          <Text style={styles.loginSubtitle}>
            Masuk untuk mengakses KampusCare
          </Text>

          <View style={styles.loginForm}>
            <View style={styles.loginFormGroup}>
              <Text style={styles.loginLabel}>Email</Text>
              <TextInput
                style={styles.loginInput}
                placeholder="nama@email.com"
                placeholderTextColor="#94A3B8"
                value={email ?? lastRegisteredEmail}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError("");
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
                  placeholder="Masukkan password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={!isReady || Boolean(storageError)}
              accessibilityState={{ disabled: !isReady || Boolean(storageError) }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.loginSignupRow}>
              <Text style={styles.loginSignupText}>Belum punya akun?</Text>
              <TouchableOpacity
                onPress={() => router.push("/signup")}
                disabled={!isReady || Boolean(storageError)}
                accessibilityState={{ disabled: !isReady || Boolean(storageError) }}
                accessibilityRole="button"
              >
                <Text style={styles.loginSignupLink}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
