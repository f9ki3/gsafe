import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isTransitioning: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authStatus = await AsyncStorage.getItem("isAuthenticated");
      setIsAuthenticated(authStatus === "true");
    } catch (error) {
      console.error("Failed to check auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async () => {
    setIsTransitioning(true);
    try {
      await AsyncStorage.setItem("isAuthenticated", "true");
    } catch (error) {
      console.error("Failed to save auth status:", error);
    }
    // Small delay to allow animation to start before state change
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsTransitioning(false);
    }, 100);
  }, []);

  const logout = useCallback(async () => {
    setIsTransitioning(true);
    try {
      await AsyncStorage.setItem("isAuthenticated", "false");
    } catch (error) {
      console.error("Failed to save auth status:", error);
    }
    // Small delay to allow animation to start before state change
    setTimeout(() => {
      setIsAuthenticated(false);
      setIsTransitioning(false);
    }, 100);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isTransitioning,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
