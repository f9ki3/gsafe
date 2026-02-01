import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const researchers = [
  "Arby Bagalay",
  "Fyke Lleva",
  "Juan dela Cruz",
  "Maria Santos",
  "Pedro Reyes",
  "Ana Garcia",
];

export default function Settings() {
  const { mode, setMode } = useSettings();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

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
            style={[styles.modeRow, mode === "auto" && styles.modeRowActive]}
            onPress={() => setMode("auto")}
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
            style={[styles.modeRow, mode === "manual" && styles.modeRowActive]}
            onPress={() => setMode("manual")}
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
            {researchers.map((name, index) => (
              <View key={index} style={styles.researcherItem}>
                <View style={styles.researcherAvatar}>
                  <Text style={styles.researcherInitial}>{name.charAt(0)}</Text>
                </View>
                <Text style={styles.researcherName}>{name}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  header: {
    paddingTop: 56,
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  researcherItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "46%",
    paddingVertical: 8,
  },
  researcherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  researcherInitial: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
  },
  researcherName: {
    flex: 1,
    fontSize: 13,
    color: "#fff",
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
    height: 20,
  },
});
