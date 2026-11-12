import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

import { styles as globalStyles } from "../style/UIstyles";

export default function DetailLokasiScreen() {
  const router = useRouter();
  const { name, latitude, longitude } = useLocalSearchParams<{
    name?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
  }>();

  const locationName = typeof name === "string" ? name : "Lokasi";
  const locationLatitude = typeof latitude === "string" ? latitude : "-";
  const locationLongitude = typeof longitude === "string" ? longitude : "-";

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.content}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.back()}
            style={detailStyles.backButton}
          >
            <Text style={detailStyles.backButtonText}>‹ Kembali</Text>
          </TouchableOpacity>

          <View style={globalStyles.heroCard}>
            <View style={globalStyles.heroTopRow}>
              <View style={globalStyles.heroBadge}>
                <Text style={globalStyles.heroBadgeText}>Lokasi Kampus</Text>
              </View>
            </View>

            <Text style={globalStyles.heroTitle}>{locationName}</Text>
            <Text style={globalStyles.heroDesc}>
              Informasi koordinat lokasi yang diambil dari API eksternal NTHU.
            </Text>
          </View>

          <View style={globalStyles.card}>
            <Text style={globalStyles.sectionTitle}>Detail Koordinat</Text>
            <Text style={globalStyles.sectionDescription}>
              Data lokasi ini menampilkan posisi geografis berdasarkan koordinat.
            </Text>

            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.label}>Latitude</Text>
              <Text style={detailStyles.value}>{locationLatitude}</Text>
            </View>

            <View style={detailStyles.infoRow}>
              <Text style={detailStyles.label}>Longitude</Text>
              <Text style={detailStyles.value}>{locationLongitude}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={globalStyles.submitButton}
            activeOpacity={0.85}
            onPress={() => router.replace("/")}
          >
            <Text style={globalStyles.submitButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButtonText: {
    color: "#7F1D1D",
    fontSize: 14,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  label: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
});
