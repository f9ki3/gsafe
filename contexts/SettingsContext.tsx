import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Firebase Realtime Database URL
const FIREBASE_URL =
  "https://gsafe-eeead-default-rtdb.asia-southeast1.firebasedatabase.app/";

type Mode = "auto" | "manual";

interface SettingsContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("manual");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchModeFromFirebase();

    // Set up polling every 2 seconds for real-time updates
    const pollInterval = setInterval(() => {
      fetchModeFromFirebase();
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  const fetchModeFromFirebase = async () => {
    try {
      const response = await fetch(`${FIREBASE_URL}config/mode.json`);
      if (response.ok) {
        const data = await response.json();
        if (data && (data.mode === "auto" || data.mode === "manual")) {
          setModeState(data.mode);
        }
      }
    } catch (error) {
      console.error("Error polling mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = async (newMode: Mode) => {
    // Optimistic update
    setModeState(newMode);

    // The actual saving to Firebase is handled by the settings page
    // This context provides real-time mode updates to all subscribers
  };

  return (
    <SettingsContext.Provider value={{ mode, setMode, isLoading }}>
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
