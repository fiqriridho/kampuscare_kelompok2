import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2563EB",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: "#F1F5F9",
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
        name="detail-ruangan"
        options={{
          title: "Detail Ruangan",
        }}
      />
      <Stack.Screen
        name="laporan-kerusakan"
        options={{
          title: "Laporan Kerusakan",
        }}
      />
    </Stack>
  );
}
