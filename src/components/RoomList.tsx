import React from "react";
import { ScrollView, Text, View } from "react-native";

import { rooms, RoomStatus } from "../data/rooms";

const STATUS_CONFIG: Record<
  RoomStatus,
  {
    label: string;
    background: string;
    text: string;
  }
> = {
  empty: {
    label: "Kosong",
    background: "#DCFCE7",
    text: "#15803D",
  },

  occupied: {
    label: "Terpakai",
    background: "#FEE2E2",
    text: "#B91C1C",
  },

  upcoming: {
    label: "Akan Datang",
    background: "#FEF3C7",
    text: "#B45309",
  },

  maintenance: {
    label: "Perbaikan",
    background: "#E5E7EB",
    text: "#4B5563",
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
        gap: 12,
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
              borderRadius: 14,
              padding: 18,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#0F172A",
                  letterSpacing: -0.3,
                }}
              >
                {room.name}
              </Text>

              <View
                style={{
                  backgroundColor: status.background,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: status.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#64748B" }}>Gedung</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  {room.building}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#64748B" }}>Kapasitas</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  {room.capacity} orang
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

