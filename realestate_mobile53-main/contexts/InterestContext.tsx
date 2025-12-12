import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type InterestType = "property" | "cars";
type UserRole = "buyer" | "seller";

interface InterestContextType {
  userInterest: InterestType;
  userRole: UserRole;
  setUserInterest: (interest: InterestType) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  setUserPreferences: (interest: InterestType, role: UserRole) => Promise<void>;
  clearPreferences: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  isLoading: boolean;
  // Helper functions
  isSeller: boolean;
  isBuyer: boolean;
  isPropertyMode: boolean;
  isCarsMode: boolean;
}

const InterestContext = createContext<InterestContextType | undefined>(
  undefined
);

export const InterestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userInterest, setUserInterestState] =
    useState<InterestType>("property");
  const [userRole, setUserRoleState] = useState<UserRole>("buyer");
  const [isLoading, setIsLoading] = useState(true);

  // Load interest and role from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [interest, role] = await Promise.all([
          AsyncStorage.getItem("userInterest"),
          AsyncStorage.getItem("userRole"),
        ]);

        if (interest === "cars" || interest === "property") {
          setUserInterestState(interest);
        }

        if (role === "buyer" || role === "seller") {
          setUserRoleState(role);
        } else if (role === "landlord") {
          // Migrate old "landlord" role to "seller"
          setUserRoleState("seller");
          await AsyncStorage.setItem("userRole", "seller");
        } else if (role === "renter") {
          // Migrate old "renter" role to "buyer"
          setUserRoleState("buyer");
          await AsyncStorage.setItem("userRole", "buyer");
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Update interest and save to AsyncStorage
  const setUserInterest = async (interest: InterestType) => {
    try {
      await AsyncStorage.setItem("userInterest", interest);
      setUserInterestState(interest);
    } catch (error) {
      console.error("Error saving user interest:", error);
    }
  };

  // Update role and save to AsyncStorage
  const setUserRole = async (role: UserRole) => {
    try {
      await AsyncStorage.setItem("userRole", role);
      setUserRoleState(role);
    } catch (error) {
      console.error("Error saving user role:", error);
    }
  };

  // Set both interest and role at once (useful during signup)
  const setUserPreferences = async (interest: InterestType, role: UserRole) => {
    try {
      await Promise.all([
        AsyncStorage.setItem("userInterest", interest),
        AsyncStorage.setItem("userRole", role),
      ]);
      setUserInterestState(interest);
      setUserRoleState(role);
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  };

  // Clear all preferences (useful during logout)
  const clearPreferences = async () => {
    try {
      console.log("🧹 Clearing user preferences and session data...");
      await AsyncStorage.multiRemove(["userInterest", "userRole"]);

      // Reset to default values
      setUserInterestState("property");
      setUserRoleState("buyer");

      console.log("✅ Preferences cleared successfully");
    } catch (error) {
      console.error("Error clearing user preferences:", error);
    }
  };

  // Refresh preferences from AsyncStorage (useful after login)
  const refreshPreferences = async () => {
    try {
      console.log("🔄 Refreshing user preferences from storage...");
      const [interest, role] = await Promise.all([
        AsyncStorage.getItem("userInterest"),
        AsyncStorage.getItem("userRole"),
      ]);

      if (interest === "cars" || interest === "property") {
        setUserInterestState(interest);
        console.log(`✅ Interest refreshed: ${interest}`);
      }

      if (role === "buyer" || role === "seller") {
        setUserRoleState(role);
        console.log(`✅ Role refreshed: ${role}`);
      }
    } catch (error) {
      console.error("Error refreshing user preferences:", error);
    }
  };

  // Helper computed values
  const isSeller = userRole === "seller";
  const isBuyer = userRole === "buyer";
  const isPropertyMode = userInterest === "property";
  const isCarsMode = userInterest === "cars";

  return (
    <InterestContext.Provider
      value={{
        userInterest,
        userRole,
        setUserInterest,
        setUserRole,
        setUserPreferences,
        clearPreferences,
        refreshPreferences,
        isLoading,
        isSeller,
        isBuyer,
        isPropertyMode,
        isCarsMode,
      }}
    >
      {children}
    </InterestContext.Provider>
  );
};

export const useInterest = (): InterestContextType => {
  const context = useContext(InterestContext);
  if (context === undefined) {
    throw new Error("useInterest must be used within an InterestProvider");
  }
  return context;
};
