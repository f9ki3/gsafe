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

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
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

          <View style={styles.inputContainer}>
            <IconSymbol size={20} name="lock.fill" color="#888" />
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.fullWidthButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.fullWidthButtonText}>Sign In</Text>
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
