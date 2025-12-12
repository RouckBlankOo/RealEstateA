/**
 * Session Manager
 * 
 * Centralized utility for managing user session data and personalization preferences.
 * This ensures consistent behavior across login, logout, and content personalization.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Session storage keys
export const SESSION_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  USER_INTEREST: "userInterest",
  USER_ROLE: "userRole",
} as const;

/**
 * Clear all session data
 * Called during logout to ensure no user data persists
 */
export const clearSessionData = async (): Promise<void> => {
  try {
    console.log("🧹 SessionManager: Clearing all session data...");
    
    await AsyncStorage.multiRemove([
      SESSION_KEYS.AUTH_TOKEN,
      SESSION_KEYS.USER_DATA,
      SESSION_KEYS.USER_INTEREST,
      SESSION_KEYS.USER_ROLE,
    ]);
    
    console.log("✅ SessionManager: All session data cleared successfully");
  } catch (error) {
    console.error("❌ SessionManager: Error clearing session data:", error);
    throw error;
  }
};

/**
 * Save user preferences after login
 * Stores interest and role for content personalization
 */
export const saveUserPreferences = async (
  interest: "property" | "cars",
  role: "buyer" | "seller"
): Promise<void> => {
  try {
    console.log(`💾 SessionManager: Saving preferences - Interest: ${interest}, Role: ${role}`);
    
    await Promise.all([
      AsyncStorage.setItem(SESSION_KEYS.USER_INTEREST, interest),
      AsyncStorage.setItem(SESSION_KEYS.USER_ROLE, role),
    ]);
    
    console.log("✅ SessionManager: Preferences saved successfully");
  } catch (error) {
    console.error("❌ SessionManager: Error saving preferences:", error);
    throw error;
  }
};

/**
 * Get current user preferences
 * Returns null if not found
 */
export const getUserPreferences = async (): Promise<{
  interest: "property" | "cars";
  role: "buyer" | "seller";
} | null> => {
  try {
    const [interest, role] = await Promise.all([
      AsyncStorage.getItem(SESSION_KEYS.USER_INTEREST),
      AsyncStorage.getItem(SESSION_KEYS.USER_ROLE),
    ]);

    if (!interest || !role) {
      return null;
    }

    return {
      interest: interest as "property" | "cars",
      role: role as "buyer" | "seller",
    };
  } catch (error) {
    console.error("❌ SessionManager: Error getting preferences:", error);
    return null;
  }
};

/**
 * Check if user has an active session
 */
export const hasActiveSession = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(SESSION_KEYS.AUTH_TOKEN);
    return !!token;
  } catch (error) {
    console.error("❌ SessionManager: Error checking session:", error);
    return false;
  }
};

/**
 * Get session info for debugging
 */
export const getSessionInfo = async (): Promise<{
  hasToken: boolean;
  hasUserData: boolean;
  interest: string | null;
  role: string | null;
}> => {
  try {
    const [token, userData, interest, role] = await Promise.all([
      AsyncStorage.getItem(SESSION_KEYS.AUTH_TOKEN),
      AsyncStorage.getItem(SESSION_KEYS.USER_DATA),
      AsyncStorage.getItem(SESSION_KEYS.USER_INTEREST),
      AsyncStorage.getItem(SESSION_KEYS.USER_ROLE),
    ]);

    return {
      hasToken: !!token,
      hasUserData: !!userData,
      interest,
      role,
    };
  } catch (error) {
    console.error("❌ SessionManager: Error getting session info:", error);
    return {
      hasToken: false,
      hasUserData: false,
      interest: null,
      role: null,
    };
  }
};
