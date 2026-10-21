import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#B91C1C",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 19,
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
