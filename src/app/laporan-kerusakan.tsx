import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { rooms } from "../data/rooms";
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

  const handleBack = () => router.back();

  const handleSubmit = () => {
    if (!location.trim()) {
      Alert.alert(
        "Lokasi Belum Diisi",
        "Silakan masukkan nama atau nomor ruangan yang mengalami kendala."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Deskripsi Belum Diisi",
        "Mohon jelaskan secara singkat kendala atau kerusakan fasilitas yang ditemukan."
      );
      return;
    }

    Alert.alert(
      "Simulasi Laporan Selesai",
      `Simulasi pengisian selesai. Laporan ini tidak disimpan atau dikirim ke petugas.\n\nDetail:\n• Lokasi: ${location}\n• Deskripsi: ${description}`,
      [
        {
          text: "Selesai",
          onPress: () => {
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />
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
                />
              </View>

              <TouchableOpacity
                style={globalStyles.submitButton}
                activeOpacity={0.85}
                onPress={handleSubmit}
              >
                <Text style={globalStyles.submitButtonText}>Kirim Laporan</Text>
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
