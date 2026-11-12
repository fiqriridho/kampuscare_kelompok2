import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { locationService } from "../services/locationService";
import { styles } from "../style/UIstyles";
import type { Location } from "../types/location";

interface RoomListProps {
  search?: string;
  reloadSignal?: number;
}

export const RoomList = ({ search, reloadSignal }: RoomListProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Guard: request lama tidak boleh memperbarui state setelah komponen dilepas
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await locationService.getLocations();
        if (!cancelled) setLocations(items);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data lokasi"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [tick, reloadSignal]);

  const keyword = (search ?? "").trim().toLowerCase();
  const displayedLocations = keyword
    ? locations.filter((location) =>
        location.name.toLowerCase().includes(keyword)
      )
    : locations;

  // Batasi render kartu; API mengembalikan ratusan lokasi
  const renderedLocations = displayedLocations.slice(0, 10);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 14,
        paddingVertical: 4,
        paddingHorizontal: 2,
      }}
    >
      {loading && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 12,
          }}
        >
          <ActivityIndicator size="small" color="#7F1D1D" />
          <Text style={{ color: "#64748B" }}>Memuat lokasi...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={{ paddingVertical: 12, gap: 8 }}>
          <Text style={{ color: "#B91C1C", fontWeight: "600" }}>{error}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => setTick((t) => t + 1)}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && displayedLocations.length === 0 && (
        <Text style={{ color: "#64748B", paddingVertical: 12 }}>
          Lokasi tidak ditemukan
        </Text>
      )}

      {!loading &&
        !error &&
        renderedLocations.map((location) => (
          <View
            key={location.name}
            style={{
              width: 280,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
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
            }}
          >
            {/* Header: Location Name & Source Badge */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569" }}>
                    LC
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0F172A",
                    letterSpacing: -0.3,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {location.name}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text
                  style={{
                    color: "#475569",
                    fontSize: 11.5,
                    fontWeight: "700",
                  }}
                >
                  NTHU
                </Text>
              </View>
            </View>

            {/* Info Badges: Coordinates */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: "#F1F5F9",
              }}
            >
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "#F8FAFC",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                  Latitude
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {location.latitude}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "#F8FAFC",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                  Longitude
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {location.longitude}
                </Text>
              </View>
            </View>
          </View>
        ))}
    </ScrollView>
  );
};
