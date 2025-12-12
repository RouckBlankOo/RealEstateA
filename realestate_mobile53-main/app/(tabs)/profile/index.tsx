import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ScreenWrapper } from "../../../components/Ui";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleMenuPress = (item: string) => {
    // Handle menu item navigation
    console.log(`Pressed: ${item}`);
  };

  const handleViewFullProfile = () => {
    // Navigate to the main profile page
    console.log("Navigating to full profile...");
    router.push("/(tabs)/profile/full-profile");
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      console.log("Logout successful");
      router.push("/onboarding/HomePage");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/onboarding/HomePage");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => {
              console.log("Profile section pressed!");
              handleViewFullProfile();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/80x80" }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split("@")[0] || t("profile.defaultUserName")}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || t("profile.noEmailAvailable")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log("View Full Profile menu item pressed!");
              handleViewFullProfile();
            }}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="person-outline" size={24} color="#666" />
              <Text style={styles.menuText}>
                {t("profile.viewFullProfile")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("Personal Information")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.menuText}>
                {t("profile.personalInformation")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("Settings")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={24} color="#666" />
              <Text style={styles.menuText}>{t("profile.settings")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("Invite Friends")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="people-outline" size={24} color="#666" />
              <Text style={styles.menuText}>{t("profile.inviteFriends")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("Help Center")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.menuText}>{t("profile.helpCenter")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF4444" />
            <Text style={styles.logoutText}>
              {loggingOut ? t("profile.loggingOut") : t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
    fontFamily: "raleway-500Medium",
  },
  userEmail: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "raleway-400Regular",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    fontFamily: "raleway-400Regular",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    marginLeft: 12,
    fontFamily: "raleway-500Medium",
  },
});
