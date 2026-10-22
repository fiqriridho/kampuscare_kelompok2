import React from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Room, rooms, RoomStatus } from "../data/rooms";

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
    background: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    dot: "•",
  },

  occupied: {
    label: "Terpakai",
    background: "#FFF1F2",
    text: "#9F1239",
    border: "#FECDD3",
    dot: "•",
  },

  upcoming: {
    label: "Akan Datang",
    background: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
    dot: "•",
  },

  maintenance: {
    label: "Perbaikan",
    background: "#F8FAFC",
    text: "#475569",
    border: "#E2E8F0",
    dot: "•",
  },
};

export const ubahStatus = (status: RoomStatus): string => {
  return STATUS_CONFIG[status].label;
};

interface RoomListProps {
  rooms?: Room[];
  search?: string;
  onSelectRoom: (roomId: string) => void;
}

export const RoomList = ({ rooms: propRooms, search, onSelectRoom }: RoomListProps) => {
  const normalizedSearch = (search ?? "").trim().toLowerCase();
  const displayedRooms =
    propRooms ??
    (search !== undefined
      ? rooms.filter((room) =>
          room.name.toLowerCase().includes(normalizedSearch)
        )
      : rooms);

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
      {displayedRooms.length === 0 ? (
        <Text style={{ color: "#64748B", paddingVertical: 12 }}>
          Ruangan tidak ditemukan
        </Text>
      ) : (
        displayedRooms.map((room) => {
          const status = STATUS_CONFIG[room.status];
          const isClickable = room.id === "R308" || room.name === "Ruang 308";

          return (
            <TouchableOpacity
              key={room.id}
              disabled={!isClickable}
              activeOpacity={isClickable ? 0.8 : 1}
              accessibilityRole={isClickable ? "button" : undefined}
              accessibilityLabel={isClickable ? `Lihat detail ${room.name}` : undefined}
              onPress={isClickable ? () => onSelectRoom(room.id) : undefined}
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
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569" }}>RK</Text>
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
                  {room.building}
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
                  {room.capacity} orang
                </Text>
              </View>
            </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};
