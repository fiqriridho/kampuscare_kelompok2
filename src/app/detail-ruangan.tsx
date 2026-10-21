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

import { styles as globalStyles } from "../style/UIstyles";

export default function DetailRuanganScreen() {
  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.content}>
          {/* Room Hero Banner */}
          <View style={detailStyles.heroBanner}>
            <View style={detailStyles.heroBadgeRow}>
              <View style={detailStyles.heroTag}>
                <Text style={detailStyles.heroTagText}>Ruang Kelas</Text>
              </View>
              <View style={detailStyles.statusBadge}>
                <Text style={detailStyles.statusBadgeText}>🟢 Kosong</Text>
              </View>
            </View>

            <Text style={detailStyles.roomTitle}>Ruang 308</Text>
            <Text style={detailStyles.roomSubtitle}>
              Gedung Kuliah Bersama 2 (GKB 2) · Lantai 3
            </Text>
          </View>

          {/* Quick Info Grid */}
          <View style={detailStyles.statsGrid}>
            <View style={detailStyles.statCard}>
              <Text style={detailStyles.statIcon}>👥</Text>
              <Text style={detailStyles.statValue}>50 Orang</Text>
              <Text style={detailStyles.statLabel}>Kapasitas</Text>
            </View>

            <View style={detailStyles.statCard}>
              <Text style={detailStyles.statIcon}>🏛️</Text>
              <Text style={detailStyles.statValue}>GKB 2</Text>
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
              <View style={[globalStyles.badge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[globalStyles.badgeText, { color: "#15803D" }]}>
                  Berfungsi
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>❄️ AC Pendingin (2 Unit)</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[globalStyles.badgeText, { color: "#15803D" }]}>
                  Dingin
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>💡 Penerangan Ruangan</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[globalStyles.badgeText, { color: "#15803D" }]}>
                  Normal
                </Text>
              </View>
            </View>

            <View style={globalStyles.infoRow}>
              <Text style={detailStyles.facilityItem}>📋 Papan Tulis & Spidol</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[globalStyles.badgeText, { color: "#15803D" }]}>
                  Lengkap
                </Text>
              </View>
            </View>

            <View style={[globalStyles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={detailStyles.facilityItem}>🔌 Terminal Listrik</Text>
              <View style={[globalStyles.badge, { backgroundColor: "#DCFCE7" }]}>
                <Text style={[globalStyles.badgeText, { color: "#15803D" }]}>
                  Aman
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={globalStyles.submitButton}
            activeOpacity={0.85}
          >
            <Text style={globalStyles.submitButtonText}>
              🚨 Laporkan Kendala di Ruangan Ini
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
  heroBanner: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#3B82F6",
    ...Platform.select({
      ios: {
        shadowColor: "#1E40AF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
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
    color: "#15803D",
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
    color: "#DBEAFE",
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
});
