import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";

import { rooms, RoomStatus } from "../data/rooms";

const STATUS_CONFIG: Record<
  RoomStatus,
  {
    label: string;
    background: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  empty: {
    label: "Kosong",
    background: "#DCFCE7",
    text: "#15803D",
    border: "#BBF7D0",
    dot: "🟢",
  },

  occupied: {
    label: "Terpakai",
    background: "#FEE2E2",
    text: "#B91C1C",
    border: "#FECACA",
    dot: "🔴",
  },

  upcoming: {
    label: "Akan Datang",
    background: "#FEF3C7",
    text: "#B45309",
    border: "#FDE68A",
    dot: "🟡",
  },

  maintenance: {
    label: "Perbaikan",
    background: "#F5F3FF",
    text: "#6D28D9",
    border: "#DDD6FE",
    dot: "🔧",
  },
};

export const ubahStatus = (status: RoomStatus): string => {
  return STATUS_CONFIG[status].label;
};

export const RoomList = () => {
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
      {rooms.map((room) => {
        const status = STATUS_CONFIG[room.status];

        return (
          <View
            key={room.id}
            style={{
              width: 280,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
              borderWidth: 1.5,
              borderColor: status.border,
              ...Platform.select({
                ios: {
                  shadowColor: "#0F172A",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                },
                android: {
                  elevation: 2,
                },
                default: {},
              }),
            }}
          >
            {/* Header: Room Name & Status Badge */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#FEF2F2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🚪</Text>
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0F172A",
                    letterSpacing: -0.3,
                  }}
                >
                  {room.name}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: status.background,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: status.border,
                }}
              >
                <Text
                  style={{
                    color: status.text,
                    fontSize: 11.5,
                    fontWeight: "700",
                  }}
                >
                  {status.dot} {status.label}
                </Text>
              </View>
            </View>

            {/* Info Badges */}
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
                  backgroundColor: "#F8FAFC",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                  Gedung
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginTop: 2,
                  }}
                >
                  🏛️ {room.building}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#F8FAFC",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                  Kapasitas
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginTop: 2,
                  }}
                >
                  👥 {room.capacity} org
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};
