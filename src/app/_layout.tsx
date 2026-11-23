import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#7F1D1D",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "KampusCare",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="detail-ruangan"
          options={{
            title: "Detail Ruangan",
          }}
        />
        <Stack.Screen
          name="detail-lokasi"
          options={{
            title: "Detail Lokasi",
          }}
        />
        <Stack.Screen
          name="laporan-kerusakan"
          options={{
            title: "Laporan Kerusakan",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
