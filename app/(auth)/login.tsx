import ThemedAlert, { useThemedAlert } from "@/components/ThemedAlert";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Firebase Realtime Database URL
const FIREBASE_URL =
  "https://gsafe-eeead-default-rtdb.asia-southeast1.firebasedatabase.app/";

interface UserData {
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { alertConfig, showAlert, hideAlert } = useThemedAlert();
  const { login } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchUserFromFirebase = async (
    email: string,
  ): Promise<UserData | null> => {
    try {
      const normalizedEmail = email.toLowerCase().replace(".", "_");
      const response = await fetch(
        `${FIREBASE_URL}users/${normalizedEmail}.json`,
      );
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    // Validate required fields
    if (!email.trim()) {
      showAlert("Validation Error", "Please enter your email", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    if (!validateEmail(email)) {
      showAlert("Validation Error", "Please enter a valid email address", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    if (!password) {
      showAlert("Validation Error", "Please enter your password", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch user from Firebase
      const userData = await fetchUserFromFirebase(email);

      if (!userData) {
        showAlert(
          "Login Failed",
          "No account found with this email. Please create an account first.",
          [
            {
              text: "Create Account",
              style: "default",
              onPress: () => router.replace("/(auth)/register"),
            },
          ],
        );
        setIsLoading(false);
        return;
      }

      // Check password
      if (userData.password !== password) {
        showAlert("Login Failed", "Incorrect password. Please try again.", [
          { text: "OK", style: "default" },
        ]);
        setIsLoading(false);
        return;
      }

      // Login successful - save to local storage via AuthContext
      login();

      // Small delay for smooth transition animation
      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 150);
    } catch (error) {
      showAlert(
        "Error",
        "An unexpected error occurred. Please check your connection and try again.",
        [{ text: "OK", style: "default" }],
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol size={60} name="flame.fill" color="#4caf50" />
          </View>
          <Text style={styles.logoText}>LPG PROTECTOR</Text>
          <Text style={styles.subtitle}>AUTOMATED ON/OFF DEVICE</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <IconSymbol size={20} name="envelope" color="#888" />
            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol size={20} name="lock" color="#888" />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <IconSymbol
                size={20}
                name={showPassword ? "eye.slash" : "eye"}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing In..." : "SIGN IN"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.fullWidthButton}
            onPress={() => router.replace("/(auth)/register")}
            disabled={isLoading}
          >
            <Text style={styles.fullWidthButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1a2a1a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4caf50",
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#4caf50",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: "600",
  },
  form: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#4caf50",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4caf50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
  },
  fullWidthButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#1a1a1a",
  },
  fullWidthButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
