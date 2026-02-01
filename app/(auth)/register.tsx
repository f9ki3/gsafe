import ThemedAlert, { useThemedAlert } from "@/components/ThemedAlert";
import { IconSymbol } from "@/components/ui/icon-symbol";
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

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { alertConfig, showAlert, hideAlert } = useThemedAlert();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().replace(".", "_");
      const response = await fetch(
        `${FIREBASE_URL}users/${normalizedEmail}.json`,
      );
      const data = await response.json();
      return data !== null;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const saveUserToFirebase = async (
    email: string,
    userData: UserData,
  ): Promise<boolean> => {
    try {
      const normalizedEmail = email.toLowerCase().replace(".", "_");
      const response = await fetch(
        `${FIREBASE_URL}users/${normalizedEmail}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );
      return response.ok;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  };

  const handleRegister = async () => {
    // Validate required fields
    if (!fullName.trim()) {
      showAlert("Validation Error", "Please enter your full name", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

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
      showAlert("Validation Error", "Please enter a password", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    if (password.length < 6) {
      showAlert(
        "Validation Error",
        "Password must be at least 6 characters long",
        [{ text: "OK", style: "default" }],
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Validation Error", "Passwords do not match", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);

      if (emailExists) {
        showAlert(
          "Registration Error",
          "This email is already registered. Please use a different email or try logging in.",
          [
            {
              text: "Sign In",
              style: "default",
              onPress: () => router.push("/login"),
            },
          ],
        );
        setIsLoading(false);
        return;
      }

      // Save user to Firebase
      const userData: UserData = {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Note: In production, use proper password hashing!
        createdAt: new Date().toISOString(),
      };

      const success = await saveUserToFirebase(email, userData);

      if (success) {
        showAlert(
          "Success!",
          "Your account has been created successfully. Welcome to LPG Protector!",
          [
            {
              text: "OK",
              style: "default",
              onPress: () => router.replace("/(tabs)/dashboard"),
            },
          ],
        );
      } else {
        showAlert(
          "Registration Failed",
          "There was an error creating your account. Please try again.",
          [{ text: "OK", style: "default" }],
        );
      }
    } catch (error) {
      showAlert(
        "Error",
        "An unexpected error occurred. Please check your connection and try again.",
        [{ text: "OK", style: "default" }],
      );
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Section */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <IconSymbol size={20} name="person" color="#888" />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              autoCapitalize="words"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

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
              placeholder="Password (min 6 characters)"
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

          <View style={styles.inputContainer}>
            <IconSymbol size={20} name="lock.fill" color="#888" />
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <IconSymbol
                size={20}
                name={showConfirmPassword ? "eye.slash" : "eye"}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating Account..." : "CREATE ACCOUNT"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.fullWidthButton}
            onPress={() => router.push("/login")}
            disabled={isLoading}
          >
            <Text style={styles.fullWidthButtonText}>Sign In</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
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
