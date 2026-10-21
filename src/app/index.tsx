import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { RoomList } from "../components/RoomList";
import { styles } from "../style/UIstyles";

export default function Index() {
  const handlePress = () => {
    Alert.alert("Lapor Kerusakan", "Tombol Ditekan");
  };
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Banner Header (Campus Red Theme) */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🎓 Portal Mahasiswa & Fasilitas</Text>
              </View>
              <Text style={{ fontSize: 26 }}>🏛️</Text>
            </View>

            <Text style={styles.heroSubtitle}>Selamat Datang di</Text>
            <Text style={styles.heroTitle}>KampusCare</Text>
            <Text style={styles.heroDesc}>
              Platform terpadu mahasiswa untuk memantau ketersediaan ruang kelas
              dan melaporkan kendala fasilitas kampus secara cepat dan transparan.
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
                <Text style={styles.actionButtonText}>🚨 Lapor Kerusakan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonSecondary}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonSecondaryText}>
                  📋 Lihat Laporan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ruang Kelas Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ruang Kelas</Text>
            </View>

            <Text style={styles.sectionDescription}>
              Lihat status dan informasi ruang kelas.
            </Text>

            {/* Modern Search Input with Icon */}
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari ruangan kelas, gedung, atau fasilitas..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <RoomList />
          </View>

          {/* Status Ruang Kelas (Responsive Colored Grid Cards) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusCardEmpty}>
                <Text style={styles.statusNumberEmpty}>1</Text>
                <Text style={[styles.statusLabel, { color: "#15803D" }]}>
                  🟢 Kosong
                </Text>
              </View>

              <View style={styles.statusCardOccupied}>
                <Text style={styles.statusNumberOccupied}>1</Text>
                <Text style={[styles.statusLabel, { color: "#B91C1C" }]}>
                  🔴 Terpakai
                </Text>
              </View>

              <View style={styles.statusCardUpcoming}>
                <Text style={styles.statusNumberUpcoming}>1</Text>
                <Text style={[styles.statusLabel, { color: "#B45309" }]}>
                  🟡 Akan Datang
                </Text>
              </View>

              <View style={styles.statusCardMaintenance}>
                <Text style={styles.statusNumberMaintenance}>1</Text>
                <Text style={[styles.statusLabel, { color: "#6D28D9" }]}>
                  🔧 Perbaikan
                </Text>
              </View>
            </View>
          </View>

          {/* Laporan Kerusakan Teratas (Warm Alert Card) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Laporan Kerusakan Teratas</Text>
            </View>

            <View style={styles.reportCard}>
              <View style={styles.reportTopRow}>
                <Text style={{ fontSize: 18 }}>⚠️</Text>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>⚡ Perlu Penanganan</Text>
                </View>
              </View>

              <Text style={styles.reportTitle}>Proyektor Ruang 201</Text>
              <Text style={styles.reportDescription}>
                Proyektor tidak dapat menyala saat sesi perkuliahan berlangsung.
              </Text>

              <View style={styles.reportFooterRow}>
                <Text style={styles.reportFooterText}>
                  📍 Ruang 201 (GKB 2) · Status: Dalam Antrean Teknisi
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
