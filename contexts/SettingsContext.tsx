import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Mode = "auto" | "manual";

interface SettingsContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("auto");

  useEffect(() => {
    loadMode();
  }, []);

  const loadMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem("mode");
      if (savedMode) {
        setModeState(savedMode as Mode);
      }
    } catch (error) {
      console.error("Failed to load mode:", error);
    }
  };

  const setMode = async (newMode: Mode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem("mode", newMode);
    } catch (error) {
      console.error("Failed to save mode:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ mode, setMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
