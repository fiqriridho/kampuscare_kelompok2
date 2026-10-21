import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

import { styles } from "../style/UIstyles";

export default function DetailRuanganScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>Informasi Ruangan</Text>
            <Text style={styles.headerTitle}>Detail Ruangan</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ruang 308</Text>
            <Text style={styles.sectionDescription}>
              Informasi lengkap fasilitas dan status ruangan saat ini.
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gedung</Text>
              <Text style={styles.infoValue}>GKB 2</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kapasitas</Text>
              <Text style={styles.infoValue}>50 orang</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: "#DCFCE7" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: "#15803D" },
                  ]}
                >
                  Kosong
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
