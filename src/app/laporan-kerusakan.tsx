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

interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "proyektor", label: "Proyektor", icon: "📽️" },
  { id: "ac", label: "AC & Kipas", icon: "❄️" },
  { id: "kursi", label: "Kursi / Meja", icon: "🪑" },
  { id: "listrik", label: "Kelistrikan", icon: "💡" },
  { id: "papan", label: "Papan Tulis", icon: "📋" },
  { id: "lainnya", label: "Lainnya", icon: "📦" },
];

interface PriorityOption {
  id: string;
  label: string;
  sublabel: string;
  badgeColor: string;
  badgeBg: string;
}

const PRIORITIES: PriorityOption[] = [
  {
    id: "low",
    label: "Rendah",
    sublabel: "Bisa ditunda",
    badgeColor: "#15803D",
    badgeBg: "#DCFCE7",
  },
  {
    id: "medium",
    label: "Sedang",
    sublabel: "Perlu perbaikan",
    badgeColor: "#B45309",
    badgeBg: "#FEF3C7",
  },
  {
    id: "high",
    label: "Mendesak",
    sublabel: "Butuh segera",
    badgeColor: "#B91C1C",
    badgeBg: "#FEE2E2",
  },
];

export default function LaporanKerusakanScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{
    roomId?: string | string[];
  }>();
  const selectedRoomId =
    typeof roomId === "string" ? roomId : undefined;
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const [selectedCategory, setSelectedCategory] = useState("proyektor");
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [location, setLocation] = useState(
    selectedRoom ? `${selectedRoom.name} (${selectedRoom.building})` : ""
  );
  const [description, setDescription] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSelectQuickRoom = (roomName: string, building: string) => {
    setLocation(`${roomName} (${building})`);
  };

  const handleTogglePhoto = () => {
    if (hasPhoto) {
      setHasPhoto(false);
      Alert.alert("Foto Dihapus", "Lampiran foto telah dihapus.");
    } else {
      setHasPhoto(true);
      Alert.alert(
        "Foto Dilampirkan",
        "Simulasi foto bukti kerusakan berhasil ditambahkan (bukti_kerusakan.jpg)."
      );
    }
  };

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

    const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);
    const priorityObj = PRIORITIES.find((p) => p.id === selectedPriority);

    Alert.alert(
      "Simulasi Laporan Selesai",
      `Simulasi pengisian selesai. Laporan ini tidak disimpan atau dikirim ke petugas.\n\nDetail:\n• Fasilitas: ${categoryObj?.label}\n• Lokasi: ${location}\n• Prioritas: ${priorityObj?.label}\n• Bukti Foto: ${
        hasPhoto ? "Tersedia" : "Tidak ada"
      }`,
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
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />
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
              onPress={() => router.back()}
              style={customStyles.cancelButton}
            >
              <Text style={customStyles.cancelButtonText}>‹ Batal</Text>
            </TouchableOpacity>

            {/* Header Banner */}
            <View style={customStyles.heroBanner}>
              <View style={customStyles.heroIconContainer}>
                <Text style={customStyles.heroIcon}>🛠️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={customStyles.heroTagline}>Layanan Pelaporan</Text>
                <Text style={customStyles.heroTitle}>Lapor Kerusakan</Text>
                <Text style={customStyles.heroDescription}>
                  Bantu kampus tetap nyaman dengan melaporkan kendala sarana &
                  prasarana.
                </Text>
              </View>
            </View>

            {/* Info Notice */}
            <View style={customStyles.noticeCard}>
              <Text style={customStyles.noticeIcon}>💡</Text>
              <Text style={customStyles.noticeText}>
                Form ini hanya simulasi. Data laporan tidak disimpan atau
                dikirim ke petugas.
              </Text>
            </View>

            {/* Form Container */}
            <View style={customStyles.mainCard}>
              {/* Kategori Kerusakan */}
              <View style={customStyles.formSection}>
                <View style={customStyles.sectionLabelRow}>
                  <Text style={customStyles.sectionLabel}>1. Jenis Fasilitas</Text>
                  <Text style={customStyles.sectionHint}>Pilih salah satu</Text>
                </View>
                <View style={customStyles.categoryGrid}>
                  {CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedCategory(category.id)}
                        style={[
                          customStyles.categoryChip,
                          isSelected && customStyles.categoryChipSelected,
                        ]}
                      >
                        <Text style={customStyles.categoryIcon}>
                          {category.icon}
                        </Text>
                        <Text
                          style={[
                            customStyles.categoryLabel,
                            isSelected && customStyles.categoryLabelSelected,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Tingkat Prioritas */}
              <View style={customStyles.formSection}>
                <View style={customStyles.sectionLabelRow}>
                  <Text style={customStyles.sectionLabel}>2. Tingkat Urgensi</Text>
                  <Text style={customStyles.sectionHint}>Tingkat dampak</Text>
                </View>
                <View style={customStyles.priorityRow}>
                  {PRIORITIES.map((priority) => {
                    const isSelected = selectedPriority === priority.id;
                    return (
                      <TouchableOpacity
                        key={priority.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedPriority(priority.id)}
                        style={[
                          customStyles.priorityCard,
                          isSelected && {
                            borderColor: priority.badgeColor,
                            backgroundColor: priority.badgeBg,
                          },
                        ]}
                      >
                        <View
                          style={[
                            customStyles.priorityRadio,
                            isSelected && {
                              borderColor: priority.badgeColor,
                              backgroundColor: priority.badgeColor,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            customStyles.priorityTitle,
                            isSelected && { color: priority.badgeColor },
                          ]}
                        >
                          {priority.label}
                        </Text>
                        <Text style={customStyles.prioritySub}>{priority.sublabel}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Lokasi Ruangan */}
              <View style={customStyles.formSection}>
                <View style={customStyles.sectionLabelRow}>
                  <Text style={customStyles.sectionLabel}>3. Lokasi / Ruangan</Text>
                  <Text style={customStyles.sectionRequired}>*Wajib</Text>
                </View>
                <TextInput
                  style={customStyles.inputField}
                  placeholder="Ketik nama ruangan (misal: Ruang 308 GKB 2)"
                  placeholderTextColor="#94A3B8"
                  value={location}
                  onChangeText={setLocation}
                />

                {/* Quick Selection Pills */}
                <Text style={customStyles.quickPillsHeading}>
                  Pilih cepat dari ruangan terdaftar:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={customStyles.quickPillsContainer}
                >
                  {rooms.map((room) => {
                    const isCurrent =
                      location.includes(room.name) &&
                      location.includes(room.building);
                    return (
                      <TouchableOpacity
                        key={room.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          handleSelectQuickRoom(room.name, room.building)
                        }
                        style={[
                          customStyles.quickPill,
                          isCurrent && customStyles.quickPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            customStyles.quickPillText,
                            isCurrent && customStyles.quickPillTextActive,
                          ]}
                        >
                          📍 {room.name} · {room.building}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Deskripsi Kerusakan */}
              <View style={customStyles.formSection}>
                <View style={customStyles.sectionLabelRow}>
                  <Text style={customStyles.sectionLabel}>
                    4. Deskripsi Kendala
                  </Text>
                  <Text style={customStyles.charCount}>
                    {description.length}/300
                  </Text>
                </View>
                <TextInput
                  style={customStyles.textAreaField}
                  placeholder="Jelaskan detail kendala, gejala kerusakan, atau bagian yang rusak..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Unggah Bukti Foto */}
              <View style={customStyles.formSection}>
                <View style={customStyles.sectionLabelRow}>
                  <Text style={customStyles.sectionLabel}>
                    5. Bukti Foto Kerusakan
                  </Text>
                  <Text style={customStyles.sectionHint}>Opsional</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTogglePhoto}
                  style={[
                    customStyles.uploadBox,
                    hasPhoto && customStyles.uploadBoxActive,
                  ]}
                >
                  <Text style={customStyles.uploadIcon}>
                    {hasPhoto ? "✅" : "📷"}
                  </Text>
                  <Text
                    style={[
                      customStyles.uploadTitle,
                      hasPhoto && { color: "#16A34A" },
                    ]}
                  >
                    {hasPhoto
                      ? "Foto Terlampir: bukti_kerusakan.jpg"
                      : "Ketuk untuk melampirkan foto"}
                  </Text>
                  <Text style={customStyles.uploadSubtitle}>
                    {hasPhoto
                      ? "Ketuk lagi untuk menghapus lampiran"
                      : "Mendukung JPG, PNG hingga 5 MB"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSubmit}
                style={customStyles.primarySubmitButton}
              >
                <Text style={customStyles.primarySubmitText}>
                  🚀 Kirim Laporan Sekarang
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const customStyles = StyleSheet.create({
  heroBanner: {
    backgroundColor: "#B91C1C",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#DC2626",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#991B1B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  cancelButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#7F1D1D",
    fontSize: 15,
    fontWeight: "700",
  },
  heroIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    fontSize: 26,
  },
  heroTagline: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FECACA",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 13,
    color: "#FEE2E2",
    marginTop: 2,
    lineHeight: 18,
  },

  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  noticeIcon: {
    fontSize: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 17,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },

  formSection: {
    marginBottom: 22,
  },
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionHint: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionRequired: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  charCount: {
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryChipSelected: {
    backgroundColor: "#FFF1F2",
    borderColor: "#7F1D1D",
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  categoryLabelSelected: {
    color: "#7F1D1D",
    fontWeight: "700",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  priorityRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    marginBottom: 6,
  },
  priorityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  prioritySub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },

  inputField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },

  quickPillsHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 10,
    marginBottom: 6,
  },
  quickPillsContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  quickPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickPillActive: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  quickPillTextActive: {
    color: "#7F1D1D",
  },

  textAreaField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 110,
    textAlignVertical: "top",
  },

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxActive: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  uploadIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  primarySubmitButton: {
    backgroundColor: "#7F1D1D",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#450A0A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  primarySubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
