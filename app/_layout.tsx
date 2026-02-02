import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Keep the splash screen visible while we hide it
SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4caf50" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading, isTransitioning } = useAuth();
  const router = useRouter();
  const rootState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Hide splash screen when app is ready
    const hideSplash = async () => {
      if (!isLoading && rootState?.key) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [isLoading, rootState?.key]);

  useEffect(() => {
    // Wait for navigation state to be ready and auth to be loaded
    if (!isLoading && rootState?.key && !hasNavigated) {
      setHasNavigated(true);
      if (isAuthenticated) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, isLoading, rootState?.key, hasNavigated]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <LoadingScreen />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 300,
        gestureEnabled: false,
        gestureDirection: "horizontal",
        contentStyle: {
          backgroundColor: "#0d0d0d",
        },
      }}
    >
      {/* Other Routes */}
      <Stack.Screen name="modal" />

      {/* Not Found Handler */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  loadingOverlay: {
    backgroundColor: "#0d0d0d",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
    fontSize: 14,
  },
});

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <SettingsProvider>
          <RootNavigator />
        </SettingsProvider>
      </AuthProvider>
    </>
  );
}
