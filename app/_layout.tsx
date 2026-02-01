import { SettingsProvider } from "@/contexts/SettingsContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <SettingsProvider>
        <Stack
          initialRouteName="(auth)/login"
          screenOptions={{ headerShown: false }}
        />
      </SettingsProvider>
    </>
  );
}
