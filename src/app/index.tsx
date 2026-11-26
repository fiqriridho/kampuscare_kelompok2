import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { RoomList } from "../components/RoomList";
import { RoomCards } from "../components/RoomCards";
import { styles } from "../style/UIstyles";
import { useAuth } from "../context/AuthContext";
import { FacilityReportRow, reportService } from "../services/reportService";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isReady, signOut } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isReady, router]);

  const handlePress = () => {
    router.push("/laporan-kerusakan");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const [search, setSearch] = useState("");
  const [reloadSignal, setReloadSignal] = useState(0);
  const [reports, setReports] = useState<FacilityReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsRefreshing, setReportsRefreshing] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const loadReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setReportsRefreshing(true);
    } else {
      setReportsLoading(true);
    }
    setReportsError(null);
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      setReportsError(
        error instanceof Error ? error.message : "Gagal memuat data laporan."
      );
    } finally {
      setReportsLoading(false);
      setReportsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      void loadReports();
    }
  }, [isReady, isAuthenticated, loadReports]);

  if (!isReady || !isAuthenticated) {
    return null;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={reportsRefreshing}
            onRefresh={() => void loadReports(true)}
            tintColor="#7F1D1D"
          />
        }
      >
        <View style={styles.content}>
          {/* Hero Banner Header (Refined Executive Burgundy Maroon) */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Portal Mahasiswa & Fasilitas</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => void handleLogout()}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Logout"
              >
                <Text style={styles.logoutButtonText}>Keluar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heroSubtitle}>Selamat Datang di</Text>
            <Text style={styles.heroTitle}>KampusCare</Text>
            <Text style={styles.heroDesc}>
              Platform resmi civitas akademika untuk monitoring ketersediaan ruang
              kelas dan pelaporan kendala fasilitas kampus.
            </Text>
          </View>

          {/* Fasilitas & Laporan Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Fasilitas & Laporan</Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePress}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonText}>Lapor Kerusakan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lokasi Kampus Section (External API NTHU) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Lokasi Kampus</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Data lokasi dari API eksternal NTHU Taiwan (bukan fasilitas resmi
              kampus).
            </Text>

            {/* Modern Clean Search Input */}
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari lokasi..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => setReloadSignal((s) => s + 1)}
            >
              <Text style={styles.actionButtonText}>Muat Ulang Lokasi</Text>
            </TouchableOpacity>

            <RoomList search={search} reloadSignal={reloadSignal} />
          </View>

          {/* Ruang Kelas (Data Lokal KampusCare) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ruang Kelas</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Lihat status dan informasi ruang kelas KampusCare.
            </Text>

            <RoomCards
              onSelectRoom={(roomId) => {
                router.push({
                  pathname: "/detail-ruangan",
                  params: { id: roomId },
                });
              }}
            />
          </View>

          {/* Status Ruang Kelas (Harmonious Pastel Cards) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusCardEmpty}>
                <Text style={styles.statusNumberEmpty}>1</Text>
                <Text style={[styles.statusLabel, { color: "#166534" }]}>
                  Kosong
                </Text>
              </View>

              <View style={styles.statusCardOccupied}>
                <Text style={styles.statusNumberOccupied}>1</Text>
                <Text style={[styles.statusLabel, { color: "#9F1239" }]}>
                  Terpakai
                </Text>
              </View>

              <View style={styles.statusCardUpcoming}>
                <Text style={styles.statusNumberUpcoming}>1</Text>
                <Text style={[styles.statusLabel, { color: "#92400E" }]}>
                  Akan Datang
                </Text>
              </View>

              <View style={styles.statusCardMaintenance}>
                <Text style={styles.statusNumberMaintenance}>1</Text>
                <Text style={[styles.statusLabel, { color: "#475569" }]}>
                  Perbaikan
                </Text>
              </View>
            </View>
          </View>

          {/* Laporan Kerusakan Teratas (Clean Professional Alert) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Laporan Kerusakan Teratas</Text>
            </View>

            <View style={styles.reportCard}>
              <View style={styles.reportTopRow}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>Perlu Penanganan</Text>
                </View>
              </View>

              <Text style={styles.reportTitle}>Proyektor Ruang 201</Text>
              <Text style={styles.reportDescription}>
                Proyektor tidak dapat menyala saat sesi perkuliahan berlangsung.
              </Text>

              <View style={styles.reportFooterRow}>
                <Text style={styles.reportFooterText}>
                  Ruang 201 (GKB 2) · Status: Dalam Antrean Teknisi
                </Text>
              </View>
            </View>
          </View>

          {/* [LIVE CODING] Daftar Laporan Cloud (Supabase SELECT + FlatList) */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Laporan Fasilitas (Cloud)</Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={() => void loadReports()}
                disabled={reportsLoading}
              >
                <Text style={styles.actionButtonText}>Muat Ulang Data</Text>
              </TouchableOpacity>
            </View>

            {reportsLoading ? (
              <View style={{ paddingVertical: 16, alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color="#7F1D1D" />
                <Text style={{ color: "#64748B", fontSize: 13 }}>
                  Memuat data dari Supabase...
                </Text>
              </View>
            ) : reportsError ? (
              <View style={styles.loginErrorContainer}>
                <Text style={styles.loginErrorText}>{reportsError}</Text>
              </View>
            ) : (
              <FlatList<FacilityReportRow>
                data={reports}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ color: "#64748B", paddingVertical: 12 }}>
                    Belum ada laporan tersimpan di cloud.
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={[styles.reportCard, { marginBottom: 10 }]}>
                    <Text style={styles.reportTitle}>{item.location}</Text>
                    <Text style={styles.reportDescription}>
                      {item.description}
                    </Text>
                    <View style={styles.reportFooterRow}>
                      <Text style={styles.reportFooterText}>
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}