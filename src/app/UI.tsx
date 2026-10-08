import { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { Room, rooms, RoomStatus } from "../data/room";
import { styles } from "./UIstyles"; // Menggunakan External Styles

const STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  empty: {
    label: "Kosong",
    bg: "#ECFDF5",
    text: "#047857",
    border: "#A7F3D0",
    dot: "#10B981",
  },
  occupied: {
    label: "Terpakai",
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
    dot: "#EF4444",
  },
  upcoming: {
    label: "Akan Datang",
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  maintenance: {
    label: "Perbaikan",
    bg: "#F3F4F6",
    text: "#4B5563",
    border: "#E5E7EB",
    dot: "#9CA3AF",
  },
};

export default function UI() {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const numColumns = width > 1024 ? 3 : width > 640 ? 2 : 1;

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.building.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || room.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const renderRoomCard = ({ item }: { item: Room }) => {
    const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.maintenance;

    return (
      /* Penerapan Inline Style untuk lebar responsif */
      <View style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}>
        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          {/* Penerapan Inline Style untuk warna bar status */}
          <View
            style={[styles.topStatusBar, { backgroundColor: config.dot }]}
          />

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.buildingName}>
                  🏢 Gedung:{" "}
                  <Text style={styles.boldText}>{item.building}</Text>
                </Text>
              </View>

              {/* Penerapan Inline Style untuk warna badge status */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: config.bg, borderColor: config.border },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: config.dot }]}
                />
                <Text style={[styles.statusText, { color: config.text }]}>
                  {config.label}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.capacityBadge}>
                <Text style={styles.capacityText}>
                  👥 Kapasitas:{" "}
                  <Text style={styles.boldText}>{item.capacity}</Text> orang
                </Text>
              </View>
              <Text style={styles.idText}>#{item.id}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.centerWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Portal Fasilitas Kampus</Text>
            <Text style={styles.headerTitle}>KampusCare 🏛️</Text>
          </View>
          <View style={styles.statsSummary}>
            <Text style={styles.statsNumber}>{rooms.length}</Text>
            <Text style={styles.statsLabel}>Total Ruang</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Cari nama ruangan atau gedung..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.filterGroup}>
            {[
              { id: "all", label: "Semua" },
              { id: "empty", label: "Kosong" },
              { id: "occupied", label: "Terpakai" },
              { id: "upcoming", label: "Akan Datang" },
              { id: "maintenance", label: "Perbaikan" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterChip,
                  selectedFilter === tab.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(tab.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === tab.id && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          key={numColumns}
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomCard}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Tidak ada ruangan yang cocok 🔍
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
