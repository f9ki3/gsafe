import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSettings } from "@/contexts/SettingsContext";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Realtime Database URL
const FIREBASE_URL =
  "https://gsafe-eeead-default-rtdb.asia-southeast1.firebasedatabase.app/";

// Request deduplication cache
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const requestCache = new Map<string, CacheEntry>();
const CACHE_TTL = 200; // 200ms cache for deduplication

// Helper function to get cached data or fetch new
const getCachedOrFetch = async function <T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(key);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const data = await fetcher();
  requestCache.set(key, { data, timestamp: now });
  return data;
};

// Helper function for fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(true);
  const [gasLevel, setGasLevel] = useState<number>(0);
  const [isOn, setIsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showGasAlert, setShowGasAlert] = useState(false);
  const vibrationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mode } = useSettings();

  // Use refs to prevent race conditions and duplicate calls
  const hasInitialFetched = useRef(false);
  const hasAlertedForHighGas = useRef(false);
  const lastGasLevelRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);
  const isOnRef = useRef(false);

  const isAutomatic = mode === "auto";
  const canToggle = !isAutomatic;

  // Trigger gas alert with vibration pattern
  const triggerGasAlert = useCallback(() => {
    // Start repeating vibration
    vibrationInterval.current = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 500);

    // Show alert dialog
    setShowGasAlert(true);
  }, []);

  // Dismiss gas alert
  const dismissGasAlert = useCallback(() => {
    // Stop vibration
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      vibrationInterval.current = null;
    }
    setShowGasAlert(false);
    hasAlertedForHighGas.current = false;
  }, []);

  // Fetch initial state from Firebase on mount
  useEffect(() => {
    if (!hasInitialFetched.current) {
      hasInitialFetched.current = true;
      fetchInitialState();
    }
  }, []);

  // Set up high-frequency polling for real-time updates (every 500ms)
  useEffect(() => {
    // Initial fetch
    fetchInitialState();

    // Poll every 500ms for faster real-time updates (was 5 seconds)
    const pollInterval = setInterval(() => {
      fetchGasLevel();
      fetchRegulatorState();
    }, 500);

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
      }
    };
  }, []);

  const fetchInitialState = async () => {
    setIsLoading(true);
    try {
      // Fetch regulator state with caching
      const regulatorResponse = await getCachedOrFetch("regulator_state", () =>
        fetchWithTimeout(`${FIREBASE_URL}regulator/state.json`),
      );

      if (regulatorResponse.ok) {
        const data = await regulatorResponse.json();
        if (data !== null) {
          isOnRef.current = data.isOn;
          setIsOn(data.isOn);
        }
      }

      // Fetch gas level
      await fetchGasLevel();

      setIsConnected(true);
    } catch (error) {
      console.error("Error fetching initial state:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGasLevel = async () => {
    try {
      // Use cached fetch to prevent duplicate requests
      const response = await getCachedOrFetch("gas_level", () =>
        fetchWithTimeout(`${FIREBASE_URL}sensors/gasLevel.json`, {}, 5000),
      );

      if (response.ok) {
        const data = await response.json();
        if (data !== null) {
          const level =
            typeof data === "number"
              ? data
              : ((data as { level?: number }).level ?? 0);
          if (typeof level === "number") {
            // Only update state if value changed (prevents unnecessary re-renders)
            if (lastGasLevelRef.current !== level) {
              lastGasLevelRef.current = level;
              setGasLevel(level);

              // Check if gas level exceeds threshold and trigger alert
              if (
                level >= 300 &&
                !hasAlertedForHighGas.current &&
                !showGasAlert
              ) {
                hasAlertedForHighGas.current = true;
                // Use setTimeout to avoid calling setState during render
                setTimeout(() => {
                  triggerGasAlert();
                }, 50);
              } else if (level < 300) {
                hasAlertedForHighGas.current = false;
              }
            }
          }
        }
      }
    } catch (error) {
      // Silently handle timeout errors during polling
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted due to timeout - this is expected
      } else {
        console.error("Error fetching gas level:", error);
      }
    }
  };

  const fetchRegulatorState = async () => {
    try {
      // Use cached fetch to prevent duplicate requests
      const response = await getCachedOrFetch("regulator_state_poll", () =>
        fetchWithTimeout(`${FIREBASE_URL}regulator/state.json`, {}, 5000),
      );

      if (response.ok) {
        const data = await response.json();
        if (data !== null && typeof data.isOn === "boolean") {
          // Only update state if it changed
          if (isOnRef.current !== data.isOn) {
            isOnRef.current = data.isOn;
            setIsOn(data.isOn);
          }
        }
      }
      setIsConnected(true);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted due to timeout
      } else {
        console.error("Error fetching regulator state:", error);
        setIsConnected(false);
      }
    }
  };

  const updateRegulatorState = async (newState: boolean) => {
    // Prevent multiple simultaneous updates
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    setIsUpdating(true);

    try {
      const response = await fetchWithTimeout(
        `${FIREBASE_URL}regulator/state.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isOn: newState,
            updatedAt: new Date().toISOString(),
          }),
        },
        10000,
      );

      if (response.ok) {
        isOnRef.current = newState;
        setIsOn(newState);
        setIsConnected(true);
        // Clear cache after update to force fresh fetch
        requestCache.delete("regulator_state");
        requestCache.delete("regulator_state_poll");
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error updating regulator state:", error);
      setIsConnected(false);
    } finally {
      isUpdatingRef.current = false;
      setIsUpdating(false);
    }
  };

  const toggleRegulator = useCallback(() => {
    if (canToggle && !isUpdating) {
      updateRegulatorState(!isOn);
    }
  }, [canToggle, isOn, isUpdating]);

  // Memoize expensive calculations for better performance
  const isDangerLevel = useMemo(() => gasLevel >= 300, [gasLevel]);
  const statusColor = useMemo(
    () => (isConnected ? "#4caf50" : "#f44336"),
    [isConnected],
  );
  const gaugeColor = useMemo(
    () => (isDangerLevel ? "#f44336" : "#4caf50"),
    [isDangerLevel],
  );

  return (
    <ThemedView style={styles.container}>
      {/* Gas Alert Modal */}
      {showGasAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertIconContainer}>
              <IconSymbol size={60} name="warning" color="#fff" />
            </View>
            <Text style={styles.alertTitle}>GAS WARNING</Text>
            <Text style={styles.alertMessage}>
              High gas level detected: {gasLevel}
            </Text>
            <Text style={styles.alertSubtext}>
              Please take immediate action!
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={dismissGasAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>OKAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header with Status */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.statusContainer}>
            {/* Internet Status */}
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusIconContainer,
                  {
                    backgroundColor: isConnected
                      ? "rgba(76, 175, 80, 0.15)"
                      : "rgba(244, 67, 54, 0.15)",
                  },
                ]}
              >
                <IconSymbol
                  size={22}
                  name={isConnected ? "wifi" : "wifi.slash"}
                  color={statusColor}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Internet</Text>
                <Text style={[styles.statusValue, { color: statusColor }]}>
                  {isConnected ? "Connected" : "Offline"}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* System Status */}
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusIconContainer,
                  { backgroundColor: "rgba(76, 175, 80, 0.15)" },
                ]}
              >
                <IconSymbol
                  size={22}
                  name="checkmark.shield.fill"
                  color="#4caf50"
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>System</Text>
                <Text style={[styles.statusValue, { color: "#4caf50" }]}>
                  {isAutomatic ? "Auto" : "Manual"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Gas Level Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol
                size={20}
                name="gauge.with.dots.needle.bottom.50percent"
                color={gaugeColor}
              />
              <Text style={styles.cardTitle}>GAS LEVEL</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.circleWrapper}>
              <View
                style={[styles.circleProgress, { borderColor: gaugeColor }]}
              >
                <View style={styles.circleInner}>
                  <Text style={[styles.gaugeValue, { color: gaugeColor }]}>
                    {gasLevel}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Gas Sensor Value</Text>
              <Text style={[styles.gaugeStatus, { color: gaugeColor }]}>
                {isDangerLevel ? "DANGER - High Level" : "Normal Level"}
              </Text>
            </View>
          </View>
        </View>

        {/* Regulator Control Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol size={20} name="power" color="#4caf50" />
              <Text style={styles.cardTitle}>REGULATOR CONTROL</Text>
            </View>
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4caf50" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            /* Single Toggle Button */
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isOn ? styles.toggleButtonOn : styles.toggleButtonOff,
                isAutomatic && styles.toggleButtonDisabled,
                isUpdating && styles.toggleButtonUpdating,
              ]}
              onPress={toggleRegulator}
              activeOpacity={0.8}
              disabled={isAutomatic || isUpdating}
            >
              {isUpdating ? (
                <View style={styles.updatingContainer}>
                  <ActivityIndicator size="small" color="#888" />
                  <Text style={styles.updatingText}>Updating...</Text>
                </View>
              ) : (
                <>
                  <IconSymbol
                    size={50}
                    name="power"
                    color={isOn ? "#fff" : "#f44336"}
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      isOn
                        ? styles.toggleButtonTextOn
                        : styles.toggleButtonTextOff,
                      isAutomatic && styles.toggleButtonTextDisabled,
                    ]}
                  >
                    {isOn ? "ON" : "OFF"}
                  </Text>
                  <Text
                    style={[
                      styles.toggleSubtext,
                      isAutomatic && styles.toggleSubtextDisabled,
                    ]}
                  >
                    {isAutomatic
                      ? "Automatic mode - Always ON"
                      : `Tap to turn ${isOn ? "off" : "on"}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f44336",
    width: "85%",
    maxWidth: 350,
  },
  alertIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f44336",
    marginBottom: 16,
    letterSpacing: 2,
  },
  alertMessage: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  alertSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  alertButton: {
    backgroundColor: "#f44336",
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    width: "100%",
  },
  alertButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
  },
  header: {
    paddingTop: Platform.OS === "android" ? 56 : 60,
    backgroundColor: "#161616",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#2a2a2a",
    marginHorizontal: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 10,
    color: "#666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 16,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  circleWrapper: {
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  circleProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  circleInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: "bold",
    lineHeight: 50,
  },
  gaugeUnit: {
    fontSize: 20,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  gaugeLabels: {
    alignItems: "center",
    marginTop: 16,
  },
  gaugeLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 6,
  },
  gaugeStatus: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
    fontSize: 14,
  },
  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  updatingText: {
    color: "#888",
    marginLeft: 8,
    fontSize: 16,
  },
  toggleButton: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    marginBottom: 16,
  },
  toggleButtonOn: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "#4caf50",
  },
  toggleButtonOff: {
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    borderColor: "#f44336",
  },
  toggleButtonDisabled: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderColor: "#555",
    opacity: 0.6,
  },
  toggleButtonUpdating: {
    opacity: 0.8,
  },
  toggleButtonText: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
    letterSpacing: 4,
  },
  toggleButtonTextOn: {
    color: "#4caf50",
  },
  toggleButtonTextOff: {
    color: "#f44336",
  },
  toggleButtonTextDisabled: {
    color: "#888",
  },
  toggleSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  toggleSubtextDisabled: {
    color: "#666",
  },
  bottomSpacing: {
    height: 100,
  },
});
