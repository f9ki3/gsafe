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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: add real auth logic
    router.replace("/(tabs)/dashboard");
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

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>SIGN IN</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.fullWidthButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.fullWidthButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
