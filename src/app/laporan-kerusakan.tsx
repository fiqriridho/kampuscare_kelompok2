import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { rooms } from "../data/rooms";
import { reportService } from "../services/reportService";
import { styles as globalStyles } from "../style/UIstyles";

export default function LaporanKerusakanScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const selectedRoomId = typeof roomId === "string" ? roomId : undefined;
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const [location, setLocation] = useState(
    selectedRoom ? `${selectedRoom.name} (${selectedRoom.building})` : ""
  );
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => router.back();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (!trimmedLocation) {
      Alert.alert(
        "Lokasi Belum Diisi",
        "Silakan masukkan nama atau nomor ruangan yang mengalami kendala."
      );
      return;
    }

    if (!trimmedDescription) {
      Alert.alert(
        "Deskripsi Belum Diisi",
        "Mohon jelaskan secara singkat kendala atau kerusakan fasilitas yang ditemukan."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        location: trimmedLocation,
        description: trimmedDescription,
      });

      Alert.alert(
        "Laporan Terkirim",
        `Laporan untuk ${trimmedLocation} berhasil disimpan ke Supabase.`,
        [
          {
            text: "Selesai",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengirim laporan ke server.";
      Alert.alert("Gagal Mengirim Laporan", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={globalStyles.content}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleBack}
              style={screenStyles.backButton}
            >
              <Text style={screenStyles.backButtonText}>‹ Batal</Text>
            </TouchableOpacity>

            <View style={globalStyles.card}>
              <Text style={globalStyles.sectionTitle}>Lapor Kerusakan</Text>
              <Text style={globalStyles.sectionDescription}>
                Sampaikan kendala fasilitas kampus untuk pemeliharaan rutin.
              </Text>

              <View style={globalStyles.formGroup}>
                <Text style={globalStyles.formLabel}>Lokasi / Ruangan *</Text>
                <TextInput
                  style={globalStyles.formInput}
                  placeholder="Contoh: Ruang 308 (GKB 2)"
                  placeholderTextColor="#94A3B8"
                  value={location}
                  onChangeText={setLocation}
                  editable={!isSubmitting}
                />
              </View>

              <View style={globalStyles.formGroup}>
                <Text style={globalStyles.formLabel}>Deskripsi Kendala *</Text>
                <TextInput
                  style={globalStyles.formTextArea}
                  placeholder="Jelaskan kendala fasilitas yang ditemukan..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  editable={!isSubmitting}
                />
              </View>

              <TouchableOpacity
                style={globalStyles.submitButton}
                activeOpacity={0.85}
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
                accessibilityState={{ disabled: isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={globalStyles.submitButtonText}>
                    Kirim Laporan
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#7F1D1D",
    fontSize: 15,
    fontWeight: "700",
  },
});
