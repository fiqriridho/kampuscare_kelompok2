import React, {useState} from "react";
import { Pressable, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, TextInput, Alert } from "react-native";

import { RoomList } from "../components/RoomList";
import { styles } from "../style/UIstyles";

export default function Index() {
  const handlePress = () => {
    Alert.alert(
      "Lapor Kerusakan",
      "Tombol Ditekan"
    )
  }
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>Portal Fasilitas Kampus</Text>

            <Text style={styles.headerTitle}>KampusCare</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fasilitas & Laporan</Text>

            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                <Text style={styles.actionButtonText}>Lapor Kerusakan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Lihat Laporan</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Ruang Kelas */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ruang Kelas</Text>

            <Text style={styles.sectionDescription}>Lihat status dan informasi ruang kelas.</Text>
            <TextInput style={styles.searchInput} placeholder="Cari ruangan..." value={search} onChangeText={setSearch} />

            <RoomList />
          </View>
          {/* Status Ruang */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Ruang Kelas</Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>1</Text>
                <Text style={styles.statusLabel}>Kosong</Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>1</Text>
                <Text style={styles.statusLabel}>Terpakai</Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>1</Text>
                <Text style={styles.statusLabel}>Akan Datang</Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={styles.statusNumber}>1</Text>
                <Text style={styles.statusLabel}>Perbaikan</Text>
              </View>
            </View>
          </View>

          {/* Laporan Kerusakan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Laporan Kerusakan Teratas</Text>

            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Proyektor Ruang 201</Text>

              <Text style={styles.reportDescription}>Proyektor tidak dapat menyala.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
