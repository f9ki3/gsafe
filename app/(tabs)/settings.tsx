import ThemedAlert, { useThemedAlert } from "@/components/ThemedAlert";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const researchers = [
  { role: "Project Manager", name: "Jiro Leigh C. Ponce" },
  { role: "Lead Programmer", name: "Abegail R. Bagalay" },
  { role: "Data Analyst", name: "Deserie M. Asilo" },
  { role: "Document Specialist", name: "John Joshua B. Bertulfo" },
  { role: "Document Specialist", name: "Ayessa Kaith R. Baluyot" },
];

type ModeType = "auto" | "manual";

// Helper function for fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 5000,
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

export default function Settings() {
  const [mode, setMode] = useState<ModeType>("manual");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { alertConfig, showAlert, hideAlert } = useThemedAlert();
  const { logout } = useAuth();

  // Use ref to prevent duplicate fetches
  const hasFetched = useRef(false);

  // Fetch mode from Firebase on mount and set up polling
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchModeFromFirebase();
    }

    // Poll every 3 seconds for real-time updates
    const pollInterval = setInterval(() => {
      fetchModeFromFirebase();
    }, 3000);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, []);

  const fetchModeFromFirebase = async () => {
    try {
      const response = await fetchWithTimeout(
        `${FIREBASE_URL}config/mode.json`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data && (data.mode === "auto" || data.mode === "manual")) {
          // Only update state if mode changed (prevents unnecessary re-renders)
          setMode((prev) => {
            if (prev !== data.mode) {
              return data.mode;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      // Silently handle timeout errors during polling
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted due to timeout - this is expected
      } else {
        console.error("Error fetching mode:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveModeToFirebase = async (newMode: ModeType) => {
    setIsSaving(true);
    try {
      // Save the mode setting
      const modeResponse = await fetchWithTimeout(
        `${FIREBASE_URL}config/mode.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: newMode,
            updatedAt: new Date().toISOString(),
          }),
        },
        10000, // 10 second timeout for updates
      );

      if (!modeResponse.ok) {
        throw new Error("Failed to save mode");
      }

      // If switching to automatic mode, turn ON the regulator
      if (newMode === "auto") {
        const regulatorResponse = await fetchWithTimeout(
          `${FIREBASE_URL}regulator/state.json`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isOn: true,
              updatedAt: new Date().toISOString(),
            }),
          },
          10000,
        );

        if (!regulatorResponse.ok) {
          throw new Error("Failed to turn on regulator");
        }
      }

      setMode(newMode);

      // Add 3-second delay before completing
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error("Error saving mode:", error);
      showAlert("Error", "Failed to save configuration. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeChange = (newMode: ModeType) => {
    if (isSaving) return;

    if (newMode === mode) return; // No change

    if (newMode === "auto") {
      showAlert(
        "Switch to Automatic Mode?",
        "This will automatically turn ON the gas regulator. The system will automatically monitor and control gas flow.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            style: "default",
            onPress: () => saveModeToFirebase(newMode),
          },
        ],
      );
    } else {
      saveModeToFirebase(newMode);
    }
  };

  const handleLogout = async () => {
    // Immediately clear the auth state
    await logout();

    // Small delay for smooth transition animation
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 150);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.gearIconContainer}>
              <IconSymbol size={28} name="gearshape.fill" color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerSubtitle}>SYSTEM CONFIGURATION</Text>
              <Text style={styles.headerTitle}>SETTINGS</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol size={20} name="switch.2" color="#4caf50" />
              <Text style={styles.cardTitle}>SWITCH CONFIGURATION</Text>
            </View>
          </View>

          {/* Automatic Mode */}
          <TouchableOpacity
            style={[
              styles.modeRow,
              mode === "auto" && styles.modeRowActive,
              isSaving && styles.modeRowDisabled,
            ]}
            onPress={() => handleModeChange("auto")}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <View style={styles.modeLeft}>
              <View
                style={[
                  styles.modeIconWrapper,
                  mode === "auto" && styles.modeIconWrapperActive,
                ]}
              >
                <IconSymbol
                  size={22}
                  name="bolt.fill"
                  color={mode === "auto" ? "#fff" : "#888"}
                />
              </View>
              <View style={styles.modeTextContainer}>
                <Text
                  style={[
                    styles.modeTitle,
                    mode === "auto" && styles.modeTitleActive,
                  ]}
                >
                  Automatic Mode
                </Text>
                <Text style={styles.modeSubtitle}>
                  Auto-monitor and control gas flow
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioCircle,
                mode === "auto" && styles.radioCircleActive,
              ]}
            >
              {mode === "auto" && (
                <IconSymbol size={14} name="checkmark" color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          {/* Manual Mode */}
          <TouchableOpacity
            style={[
              styles.modeRow,
              mode === "manual" && styles.modeRowActive,
              isSaving && styles.modeRowDisabled,
            ]}
            onPress={() => handleModeChange("manual")}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <View style={styles.modeLeft}>
              <View
                style={[
                  styles.modeIconWrapper,
                  mode === "manual" && styles.modeIconWrapperActive,
                ]}
              >
                <IconSymbol
                  size={22}
                  name="hand.raised.fill"
                  color={mode === "manual" ? "#fff" : "#888"}
                />
              </View>
              <View style={styles.modeTextContainer}>
                <Text
                  style={[
                    styles.modeTitle,
                    mode === "manual" && styles.modeTitleActive,
                  ]}
                >
                  Manual Mode
                </Text>
                <Text style={styles.modeSubtitle}>
                  Manually control from dashboard
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radioCircle,
                mode === "manual" && styles.radioCircleActive,
              ]}
            >
              {mode === "manual" && (
                <IconSymbol size={14} name="checkmark" color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          {/* Saving Indicator */}
          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color="#4caf50" />
              <Text style={styles.savingText}>Updating configuration...</Text>
            </View>
          )}
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol size={20} name="info.circle.fill" color="#4caf50" />
              <Text style={styles.cardTitle}>ABOUT</Text>
            </View>
          </View>
          <View style={styles.aboutContent}>
            <View style={styles.aboutIconRow}>
              <IconSymbol size={48} name="flame.fill" color="#f44336" />
            </View>
            <Text style={styles.aboutTitle}>LPG Protector System</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutText}>
              LPG protector system with automated on/off device. researchers
              from la conception college. the objective is to sense gas and shut
              the gas regulator. can automatic or manual.
            </Text>
          </View>
        </View>

        {/* Researchers Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <IconSymbol size={20} name="person.2.fill" color="#4caf50" />
              <Text style={styles.cardTitle}>RESEARCHERS</Text>
            </View>
          </View>
          <View style={styles.researchersGrid}>
            {researchers.map((researcher, index) => (
              <View key={index}>
                <View style={styles.researcherItem}>
                  <View style={styles.researcherLeft}>
                    <View style={styles.researcherAvatar}>
                      <Text style={styles.researcherInitial}>
                        {researcher.name.charAt(0)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.researcherInfo}>
                    <Text style={styles.researcherName}>{researcher.name}</Text>
                    <Text style={styles.researcherRole}>{researcher.role}</Text>
                  </View>
                </View>
                {index < researchers.length - 1 && (
                  <View style={styles.researcherSeparator} />
                )}
              </View>
            ))}
          </View>
          <View style={styles.researcherFooter}>
            <IconSymbol size={16} name="graduationcap.fill" color="#4caf50" />
            <Text style={styles.researcherFooterText}>
              La Conception College
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol
            size={20}
            name="rectangle.portrait.and.arrow.right"
            color="#fff"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  gearIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    marginLeft: 14,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    letterSpacing: 2,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
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
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#1a1a1a",
    marginBottom: 12,
  },
  modeRowActive: {
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderColor: "#4caf50",
  },
  modeRowDisabled: {
    opacity: 0.6,
  },
  modeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  modeIconWrapperActive: {
    backgroundColor: "#4caf50",
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
  },
  modeTitleActive: {
    color: "#fff",
  },
  modeSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  radioCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#4caf50",
    backgroundColor: "#4caf50",
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    marginTop: 8,
  },
  savingText: {
    color: "#4caf50",
    marginLeft: 8,
    fontSize: 13,
  },
  aboutContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  aboutIconRow: {
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 13,
    color: "#4caf50",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
    fontStyle: "italic",
  },
  researchersGrid: {
    flexDirection: "column",
    gap: 0,
  },
  researcherItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  researcherLeft: {
    alignItems: "center",
    marginRight: 12,
  },
  researcherInfo: {
    flex: 1,
    justifyContent: "center",
  },
  researcherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",
  },
  researcherInitial: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
  },
  researcherName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  researcherRole: {
    fontSize: 12,
    color: "#888",
  },
  researcherSeparator: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginLeft: 52,
  },
  researcherFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  researcherFooterText: {
    fontSize: 13,
    color: "#888",
    marginLeft: 6,
    fontStyle: "italic",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c62828",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 100,
  },
});
