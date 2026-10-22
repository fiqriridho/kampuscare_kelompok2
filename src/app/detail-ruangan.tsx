import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { RoomStatus, rooms } from "../data/rooms";
import { styles as globalStyles } from "../style/UIstyles";

const STATUS_DETAILS: Record<
  RoomStatus,
  { label: string; icon: string; color: string }
> = {
  empty: { label: "Kosong", icon: "🟢", color: "#166534" },
  occupied: { label: "Terpakai", icon: "🔴", color: "#9F1239" },
  upcoming: { label: "Akan Datang", icon: "🟡", color: "#92400E" },
  maintenance: { label: "Perbaikan", icon: "🔧", color: "#475569" },
};

export default function DetailRuanganScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = typeof id === "string" ? id : undefined;
  const room = rooms.find((item) => item.id === roomId);

  const handleBack = () => router.back();
  const handleGoHome = () => router.replace("/");
  const handleReport = () => {
    if (room) {
      router.push({
        pathname: "/laporan-kerusakan",
        params: { roomId: room.id },
      });
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.content}>
          {!room ? (
            <View style={globalStyles.card}>
              <Text style={globalStyles.sectionTitle}>Ruangan tidak ditemukan</Text>
              <Text style={globalStyles.sectionDescription}>
                ID ruangan {roomId ? `"${roomId}"` : "tidak tersedia"} tidak
                cocok dengan data ruangan.
              </Text>
              <TouchableOpacity
                style={globalStyles.submitButton}
                activeOpacity={0.85}
                onPress={handleGoHome}
              >
                <Text style={globalStyles.submitButtonText}>
                  Kembali ke Beranda
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleBack}
                style={detailStyles.backButton}
              >
                <Text style={detailStyles.backButtonText}>‹ Kembali</Text>
              </TouchableOpacity>

          {/* Room Hero Banner */}
          <View style={detailStyles.heroBanner}>
            <View style={detailStyles.heroBadgeRow}>
              <View style={detailStyles.heroTag}>
                <Text style={detailStyles.heroTagText}>Ruang Kelas</Text>
              </View>
              <View style={detailStyles.statusBadge}>
                <Text
                  style={[
                    detailStyles.statusBadgeText,
                    { color: STATUS_DETAILS[room.status].color },
                  ]}
                >
                  {STATUS_DETAILS[room.status].icon}{" "}
                  {STATUS_DETAILS[room.status].label}
                </Text>
              </View>
            </View>

            <Text style={detailStyles.roomTitle}>{room.name}</Text>
            <Text style={detailStyles.roomSubtitle}>
              Gedung {room.building} · ID {room.id}
            </Text>
          </View>

          {/* Quick Info Grid */}
          <View style={detailStyles.statsGrid}>
            <View style={detailStyles.statCard}>
              <Text style={detailStyles.statIcon}>👥</Text>
              <Text style={detailStyles.statValue}>{room.capacity} Orang</Text>
              <Text style={detailStyles.statLabel}>Kapasitas</Text>
            </View>

            <View style={detailStyles.statCard}>
              <Text style={detailStyles.statIcon}>🏛️</Text>
              <Text style={detailStyles.statValue}>{room.building}</Text>
              <Text style={detailStyles.statLabel}>Gedung</Text>
            </View>

            <View style={detailStyles.statCard}>
              <Text style={detailStyles.statIcon}>📶</Text>
              <Text style={detailStyles.statValue}>Tersedia</Text>
              <Text style={detailStyles.statLabel}>Wi-Fi Kampus</Text>
            </View>
          </View>

          {/* Facility Checklist Card */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.sectionTitle}>Fasilitas Ruangan</Text>
            <Text style={globalStyles.sectionDescription}>
              Daftar kelengkapan sarana yang ada di dalam ruangan ini.
            </Text>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>📽️ Proyektor LCD</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[globalStyles.badgeText, { color: "#166534" }]}>
                  Berfungsi
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>❄️ AC Pendingin (2 Unit)</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[globalStyles.badgeText, { color: "#166534" }]}>
                  Dingin
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>💡 Penerangan Ruangan</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[globalStyles.badgeText, { color: "#166534" }]}>
                  Normal
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>📋 Papan Tulis & Spidol</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[globalStyles.badgeText, { color: "#166534" }]}>
                  Lengkap
                </Text>
              </View>
            </View>

            <View style={[globalStyles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={detailStyles.facilityItem}>🔌 Terminal Listrik</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#F0FDF4" }]}>
                <Text style={[globalStyles.badgeText, { color: "#166534" }]}>
                  Aman
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={globalStyles.submitButton}
            activeOpacity={0.85}
            onPress={handleReport}
          >
            <Text style={globalStyles.submitButtonText}>
              🚨 Laporkan Kendala di Ruangan Ini
            </Text>
          </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
  heroBanner: {
    backgroundColor: "#7F1D1D",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#991B1B",
    ...Platform.select({
      ios: {
        shadowColor: "#450A0A",
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
  heroBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTag: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroTagText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
  },
  roomTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: 13.5,
    color: "#FECDD3",
    fontWeight: "500",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },

  facilityItem: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
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
