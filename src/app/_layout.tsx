import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#0F172A",
        headerTitleStyle: {
          fontWeight: "700",
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
