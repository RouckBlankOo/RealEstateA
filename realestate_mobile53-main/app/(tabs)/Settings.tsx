import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { ScreenWrapper } from "../../components/Ui";
import i18n from "../../services/i18n";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentLanguage, supportedLanguages, changeLanguage, t } =
    useLanguage();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);
  const [showAccountModal, setShowAccountModal] = React.useState(false);
  const [locale, setLocale] = React.useState(i18n.locale);

  // Sample accounts - replace with real data from your auth system
  const [savedAccounts] = React.useState([
    {
      id: "1",
      name: "Mohamed mohsen",
      email: "mohamed@example.com",
      avatar: "https://ui-avatars.com/api/?name=Mohamed+mohsen",
      role: "Buyer",
    },
    {
      id: "2",
      name: "Mohamed mohsen",
      email: "mohamed.seller@example.com",
      avatar: "https://ui-avatars.com/api/?name=Mohamed+mohsen",
      role: "Seller",
    },
  ]);

  // Listen for language changes - same pattern as _layout.tsx
  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);

    return () => clearInterval(checkLocale);
  }, [locale]);

  // Handle logout with confirmation
  const handleLogout = React.useCallback(async () => {
    Alert.alert(
      t("settings.logoutConfirmTitle"),
      t("settings.logoutConfirmMessage"),
      [
        {
          text: t("settings.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Navigate to signin screen
              router.replace("/auth/SignIn" as any);
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert(t("settings.error"), t("settings.logoutError"));
            }
          },
        },
      ]
    );
  }, [t, logout, router]);

  const settingsOptions = React.useMemo(
    () => [
      // Reorder and present items to match design exactly
      {
        id: "payments",
        title: t("settings.payments"),
        iconSource: require("../../assets/Icons/payments.png"),
        type: "navigation",
        onPress: () => console.log("Navigate to Payments"),
      },
      {
        id: "history",
        title: t("settings.history"),
        iconSource: require("../../assets/Icons/History.png"),
        type: "navigation",
        onPress: () => console.log("Navigate to History"),
      },
      {
        id: "notifications",
        title: t("settings.notificationSettings"),
        iconSource: require("../../assets/Icons/Notification Settings.png"),
        type: "navigation",
        onPress: () => console.log("Navigate to Notification Settings"),
      },
      {
        id: "support",
        title: t("helpAndSupport"),
        iconSource: require("../../assets/Icons/Support.png"),
        type: "navigation",
        onPress: () => router.push("/support" as any),
      },
      {
        id: "terms",
        title: t("settings.termsAndPolicies"),
        iconSource: require("../../assets/Icons/Policy.png"),
        type: "navigation",
        onPress: () => console.log("Navigate to Terms"),
      },
      // Keep language button integrated
      {
        id: "language",
        title: t("settings.language"),
        iconSource: require("../../assets/Icons/Vector.png"),
        type: "language",
        value:
          currentLanguage === "en"
            ? "English"
            : currentLanguage === "fr"
            ? "Français"
            : "العربية",
      },
      {
        id: "switch_account",
        title: t("settings.switchAccount"),
        iconSource: require("../../assets/Icons/Switch_Account.png"),
        type: "navigation",
        onPress: () => setShowAccountModal(true),
      },
      {
        id: "logout",
        title: t("settings.logout"),
        iconSource: require("../../assets/Icons/logout.png"),
        type: "logout",
        onPress: handleLogout,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, currentLanguage, handleLogout, locale]
  );

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={() => {
          if (item.onPress) {
            item.onPress();
          } else if (item.type === "navigation") {
            // Handle navigation
            console.log(`Navigate to ${item.title}`);
          } else if (item.type === "language") {
            setShowLanguageModal(true);
          }
        }}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.iconCircle,
              item.type === "logout" && styles.logoutIconCircle,
            ]}
          >
            <Image
              source={item.iconSource}
              style={styles.settingIconImage}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.settingTitle,
              item.type === "logout" && styles.logoutTitle,
            ]}
          >
            {item.title}
          </Text>
        </View>

        <View style={styles.settingItemRight}>
          {item.type === "toggle" ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: "#E8E8E8", true: "#FF8C42" }}
              thumbColor={item.value ? "#ffffff" : "#ffffff"}
            />
          ) : (
            <>
              {item.value && (
                <Text style={styles.settingValue}>{item.value}</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color="#8A8A8A" />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            {(user as any)?.avatar ? (
              <Image
                source={{ uri: (user as any).avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Image
                source={require("../../assets/sam b.png")}
                style={styles.avatarImage}
              />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.email || t("settings.user")}
            </Text>
            <Text style={styles.profileEmail}>
              {t("settings.premiumMember")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/edit-info" as any)}
          >
            <Image
              source={require("../../assets/Icons/Edit.png")}
              style={styles.EditIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map(renderSettingItem)}
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>{t("settings.version")} 1.0.0</Text>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          {/* Blur the background instead of a dark backdrop */}
          <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
            {/* Touchable backdrop to close modal when tapping outside */}
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowLanguageModal(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("settings.language")}</Text>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={supportedLanguages}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.languageItem,
                      currentLanguage === item.code &&
                        styles.selectedLanguageItem,
                    ]}
                    onPress={async () => {
                      const success = await changeLanguage(item.code);
                      if (success) {
                        setShowLanguageModal(false);
                      }
                    }}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{item.name}</Text>
                      <Text style={styles.languageNative}>
                        {item.nativeName}
                      </Text>
                    </View>
                    {currentLanguage === item.code && (
                      <Ionicons name="checkmark" size={24} color="#FF8C42" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </BlurView>
        </Modal>

        {/* Switch Account Bottom Sheet Modal */}
        <Modal
          visible={showAccountModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAccountModal(false)}
        >
          <BlurView intensity={2} style={styles.accountModalOverlay}>
            <TouchableOpacity
              style={styles.accountModalBackdrop}
              activeOpacity={1}
              onPress={() => setShowAccountModal(false)}
            />
            <View style={styles.accountBottomSheet}>
              {/* Header */}
              <View style={styles.accountSheetHeader}>
                <Image
                  source={require("../../assets/Icons/account_circle.png")}
                  style={styles.accountCircleIcon}
                />
                <Text style={styles.accountSheetTitle}>
                  {t("settings.switchAccountTitle")}
                </Text>
              </View>

              {/* Account List */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {savedAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={styles.accountItem}
                    onPress={() => {
                      // Handle account switch
                      console.log("Switch to account:", account.email);
                      setShowAccountModal(false);
                    }}
                  >
                    <Image
                      source={{ uri: account.avatar }}
                      style={styles.accountAvatar}
                    />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountEmail}>{account.email}</Text>
                    </View>
                    <Text style={styles.accountRole}>
                      {account.role === "Buyer"
                        ? t("settings.buyer")
                        : t("settings.seller")}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Add New Account Button */}
                <TouchableOpacity
                  style={styles.addAccountButton}
                  onPress={() => {
                    setShowAccountModal(false);
                    // Navigate to sign in/sign up
                    router.push("/auth/SignIn" as any);
                  }}
                >
                  <Text style={styles.addAccountText}>
                    {t("settings.addNewAccount")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </BlurView>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "transparent",
    marginHorizontal: -5,
    borderRadius: 15,
    marginBottom: 30,
    marginTop: 60,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF0E6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    fontFamily: "raleway-500Medium",
  },
  profileEmail: {
    fontSize: 14,
    color: "#8A8A8A",
    fontFamily: "raleway-400Regular",
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  EditIcon: {
    width: 22,
    height: 22,
  },
  logoutIconCircle: {
    backgroundColor: "#FFF5F5",
  },
  settingTitle: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    fontFamily: "raleway-500Medium",
  },
  logoutTitle: {
    color: "#FF4444",
  },
  settingIconImage: {
    width: 22,
    height: 22,
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: "#8A8A8A",
    fontFamily: "raleway-400Regular",
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE6E6",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "raleway-500Medium",
    color: "#FF4444",
    marginLeft: 8,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 12,
    color: "#B0B0B0",
    fontFamily: "comfortaa-400Regular",
  },
  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 560,
    maxHeight: "70%",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "raleway-500Medium",
    color: "#333333",
  },
  closeButton: {
    padding: 5,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedLanguageItem: {
    backgroundColor: "#FFF0E6",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "raleway-500Medium",
    color: "#333333",
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    color: "#8A8A8A",
    fontFamily: "raleway-400Regular",
  },
  // Account Switch Modal Styles
  accountModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  accountModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accountBottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  accountSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  accountCircleIcon: {
    width: 28,
    height: 28,
    tintColor: "#FF8C42",
    marginRight: 10,
  },
  accountSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Raleway-Bold",
    color: "#FF8C42",
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  accountAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
    color: "#333333",
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 13,
    color: "#8A8A8A",
    fontFamily: "Raleway-Regular",
  },
  accountRole: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
    color: "#FF8C42",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addAccountButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  addAccountText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
    color: "#FF8C42",
  },
});
