import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useInterest } from "../../contexts/InterestContext";
import { t } from "../../services/i18n";
import { ProfileStyles, GlobalStyles } from "../../components/styles";
import { ErrorPopup } from "../../components/Ui/ErrorPopup";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userInterest, userRole } = useInterest();
  const [activeTab, setActiveTab] = useState<"items" | "reviews">("items");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine if user is a seller
  const isSeller = userRole === "seller" || user?.userType === "seller";

  // Sample data - In production, fetch from API based on role and interest
  // For sellers: their listings (properties or cars)
  // For buyers: their liked items (properties or cars based on interest)
  const items = [
    {
      id: 1,
      image: require("../../assets/images/ScreensImages/ProfileComplete.png"),
      title: isSeller ? "My Listing 1" : "Liked Item 1",
    },
    {
      id: 2,
      image: require("../../assets/images/Auth/Appartment.png"),
      title: isSeller ? "My Listing 2" : "Liked Item 2",
    },
    {
      id: 3,
      image: require("../../assets/images/Auth/Appartment.png"),
      title: isSeller ? "My Listing 3" : "Liked Item 3",
    },
    {
      id: 4,
      image: require("../../assets/images/Auth/Appartment.png"),
      title: isSeller ? "My Listing 4" : "Liked Item 4",
    },
    {
      id: 5,
      image: require("../../assets/images/Auth/Appartment.png"),
      title: isSeller ? "My Listing 5" : "Liked Item 5",
    },
    {
      id: 6,
      image: require("../../assets/images/Auth/Appartment.png"),
      title: isSeller ? "My Listing 6" : "Liked Item 6",
    },
  ];

  // Get appropriate label based on role and interest
  const getItemsLabel = () => {
    if (isSeller) {
      return userInterest === "cars" ? "My Cars" : "My Listings";
    } else {
      return userInterest === "cars" ? "Liked Cars" : "Liked Properties";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
      router.push("/onboarding/HomePage");
    } catch (error: any) {
      console.error("Logout error:", error);
      setErrorMessage(
        error?.message ||
          (typeof error === "string" ? error : JSON.stringify(error)) ||
          "Unknown error"
      );
      setShowError(true);
      router.push("/onboarding/HomePage");
    }
  };

  const renderItemGrid = () => {
    return (
      <View style={ProfileStyles.propertyGrid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={ProfileStyles.propertyGridItem}
          >
            <Image
              source={item.image}
              style={ProfileStyles.propertyGridImage}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render main profile layout (used for both sellers and buyers)
  const renderMainProfile = () => (
    <View style={GlobalStyles.container}>
      <ErrorPopup
        message={errorMessage}
        visible={showError}
        onHide={() => setShowError(false)}
      />
      {/* Header with background image */}
      <View style={ProfileStyles.headerContainer}>
        <Image
          source={require("../../assets/images/ScreensImages/ProfileComplete.png")}
          style={ProfileStyles.headerBackgroundImage}
        />
        {/* Header navigation */}
        <View style={ProfileStyles.headerTop}>
          <TouchableOpacity
            style={ProfileStyles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={ProfileStyles.iconButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile image positioned at bottom of header */}
        <View style={ProfileStyles.profileImageWrapper}>
          <View style={ProfileStyles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              }}
              style={ProfileStyles.profileImage}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={ProfileStyles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={ProfileStyles.profileSection}>
          <Text style={ProfileStyles.profileName}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email?.split("@")[0] || "Mohamed Mohsen"}
          </Text>
          <View style={ProfileStyles.locationContainer}>
            <Ionicons name="location" size={16} color="#666666" />
            <Text style={ProfileStyles.locationText}>Djerba, Tunisia</Text>
          </View>

          {/* Stats Section - Only show for sellers */}
          {isSeller && (
            <View style={ProfileStyles.statsContainer}>
              <View style={ProfileStyles.statItem}>
                <Text style={ProfileStyles.statNumber}>122</Text>
                <Text style={ProfileStyles.statLabel}>
                  {t("profile.followers")}
                </Text>
              </View>
              <View style={ProfileStyles.statItem}>
                <Text style={ProfileStyles.statNumber}>4,5</Text>
                <Text style={ProfileStyles.statLabel}>
                  {t("profile.rating")}
                </Text>
              </View>
              <View style={ProfileStyles.statItem}>
                <Text style={ProfileStyles.statNumber}>37</Text>
                <Text style={ProfileStyles.statLabel}>Sold/Rent</Text>
              </View>
            </View>
          )}

          {/* Action Buttons - Different for Sellers vs Buyers */}
          <View style={ProfileStyles.actionButtons}>
            {isSeller ? (
              // Seller: Edit Profile + Add Item
              <>
                <TouchableOpacity style={ProfileStyles.outlineButton}>
                  <Text style={ProfileStyles.outlineButtonText}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ProfileStyles.filledButton}
                  onPress={() => {
                    // Route to different screens based on interest
                    if (userInterest === "cars") {
                      router.push("/add-car");
                    } else {
                      router.push("/add-house");
                    }
                  }}
                >
                  <Text style={ProfileStyles.filledButtonText}>Add Item</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Buyer: Only Edit Profile button
              <TouchableOpacity
                style={[ProfileStyles.filledButton, { flex: 1 }]}
              >
                <Text style={ProfileStyles.filledButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs Section */}
        <View style={ProfileStyles.tabsContainer}>
          <TouchableOpacity
            style={[
              ProfileStyles.tab,
              activeTab === "items" && ProfileStyles.activeTab,
            ]}
            onPress={() => setActiveTab("items")}
          >
            <Text
              style={[
                ProfileStyles.tabText,
                activeTab === "items" && ProfileStyles.activeTabText,
              ]}
            >
              {getItemsLabel()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ProfileStyles.tab,
              activeTab === "reviews" && ProfileStyles.activeTab,
            ]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[
                ProfileStyles.tabText,
                activeTab === "reviews" && ProfileStyles.activeTabText,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === "items" ? (
          renderItemGrid()
        ) : (
          <View style={ProfileStyles.reviewsContainer}>
            <Text style={ProfileStyles.reviewsText}>No reviews yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // Both sellers and buyers use the same main profile layout now
  return renderMainProfile();
}
