import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "../style/UIstyles";

export default function LaporanKerusakanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>Formulir Pelaporan</Text>
            <Text style={styles.headerTitle}>Laporan Kerusakan</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detail Fasilitas</Text>
            <Text style={styles.sectionDescription}>
              Laporkan kerusakan sarana dan prasarana kampus.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Lokasi / Ruangan</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: Ruang 201 GKB 2"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Deskripsi Kerusakan</Text>
              <TextInput
                style={styles.formTextArea}
                placeholder="Jelaskan kendala fasilitas yang ditemukan..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Kirim Laporan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
