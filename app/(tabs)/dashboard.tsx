import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Dashboard() {
  const [isConnected] = useState(true);
  const [gasLevel] = useState(75);
  const [isOn, setIsOn] = useState(false);
  const { mode } = useSettings();

  const isAutomatic = mode === "auto";
  const canToggle = !isAutomatic;

  const toggleRegulator = () => {
    if (canToggle) {
      setIsOn(!isOn);
    }
  };

  return (
    <ThemedView style={styles.container}>
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
                  color={isConnected ? "#4caf50" : "#f44336"}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Internet</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: isConnected ? "#4caf50" : "#f44336" },
                  ]}
                >
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
                  Active
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
                color="#4caf50"
              />
              <Text style={styles.cardTitle}>GAS LEVEL</Text>
            </View>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.circleWrapper}>
              <View
                style={[
                  styles.circleProgress,
                  {
                    borderColor: gasLevel > 80 ? "#f44336" : "#4caf50",
                  },
                ]}
              >
                <View style={styles.circleInner}>
                  <Text style={styles.gaugeValue}>{gasLevel}</Text>
                  <Text style={styles.gaugeUnit}>%</Text>
                </View>
              </View>
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Gas Safety Level</Text>
              <Text
                style={[
                  styles.gaugeStatus,
                  {
                    color: gasLevel > 80 ? "#f44336" : "#4caf50",
                  },
                ]}
              >
                {gasLevel > 80 ? "High Level" : "Normal Level"}
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

          {/* Single Toggle Button */}
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isOn ? styles.toggleButtonOn : styles.toggleButtonOff,
              isAutomatic && styles.toggleButtonDisabled,
            ]}
            onPress={toggleRegulator}
            activeOpacity={0.8}
            disabled={isAutomatic}
          >
            <IconSymbol
              size={50}
              name="power"
              color={isOn ? "#fff" : "#f44336"}
            />
            <Text
              style={[
                styles.toggleButtonText,
                isOn ? styles.toggleButtonTextOn : styles.toggleButtonTextOff,
                isAutomatic && styles.toggleButtonTextDisabled,
              ]}
            >
              {isOn ? "ON" : "OFF"}
            </Text>
            <Text style={styles.toggleSubtext}>
              {isAutomatic
                ? "Automatic mode"
                : `Tap to turn ${isOn ? "off" : "on"}`}
            </Text>
          </TouchableOpacity>
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
    color: "#fff",
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
  bottomSpacing: {
    height: 20,
  },
});
