import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useInterest } from "../../../contexts/InterestContext";
import { t } from "../../../services/i18n";
import { ProfileStyles, GlobalStyles } from "../../../components/styles";
import { getMyListings, Property } from "../../../services/propertyService";

export default function FullProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userInterest, userRole } = useInterest();
  const [activeTab, setActiveTab] = useState<"available" | "reviews">(
    "available"
  );
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // Determine if user is a seller
  const isSeller = userRole === "seller" || user?.userType === "seller";

  // Fetch user's properties when component mounts or when user changes
  useEffect(() => {
    if (isSeller && user?._id) {
      fetchUserProperties();
    }
  }, [isSeller, user?._id]);

  const fetchUserProperties = async () => {
    setIsLoadingProperties(true);
    try {
      console.log("📦 Fetching user properties...");
      const properties = await getMyListings();

      console.log(`✅ Fetched ${properties.length} user properties`);

      // Log properties to check IDs and media (backend now returns 'id' not '_id')
      properties.forEach((prop: any, index: number) => {
        if (!prop.id && !prop._id) {
          console.warn(`⚠️ Property at index ${index} has no ID:`, prop);
        }
        console.log(`Property ${index}:`, {
          id: prop.id,
          title: prop.title,
          media: prop.media,
          firstImage: prop.media?.images?.[0],
        });
      });

      // Filter out properties without valid IDs (check both 'id' and '_id')
      const validProperties = properties.filter(
        (prop: any) => prop && (prop.id || prop._id)
      );
      console.log(`✅ ${validProperties.length} properties with valid IDs`);

      setUserProperties(validProperties);
    } catch (error) {
      console.error("❌ Error fetching user properties:", error);
      setUserProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
      router.push("/onboarding/HomePage");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/onboarding/HomePage");
    }
  };

  const renderPropertyGrid = () => {
    if (isLoadingProperties) {
      return (
        <View
          style={[
            ProfileStyles.propertyGrid,
            {
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 40,
            },
          ]}
        >
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 12, color: "#666", fontSize: 14 }}>
            Loading properties...
          </Text>
        </View>
      );
    }

    if (userProperties.length === 0) {
      return (
        <View
          style={[
            ProfileStyles.propertyGrid,
            {
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            },
          ]}
        >
          <Ionicons name="home-outline" size={64} color="#E0E0E0" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              fontWeight: "600",
              color: "#333",
            }}
          >
            No Properties Yet
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            Start by adding your first property listing
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 24,
              backgroundColor: "#FF6B35",
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: 25,
            }}
            onPress={() => {
              if (userInterest === "cars") {
                router.push("/add-car");
              } else {
                router.push("/add-house");
              }
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              {t("profile.addItem")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={ProfileStyles.propertyGrid}>
        {userProperties.map((property, index) => {
          // Backend may return 'id' or '_id'
          const propertyKey =
            property.id || property._id || `property-${index}`;
          const firstImage = property.media?.images?.[0];

          console.log(`🖼️ Rendering property ${index}:`, {
            id: propertyKey,
            title: property.title,
            hasMedia: !!property.media,
            imagesArray: property.media?.images,
            firstImage: firstImage,
            imageCount: property.media?.images?.length || 0,
          });

          return (
            <TouchableOpacity
              key={propertyKey}
              style={ProfileStyles.propertyGridItem}
              onPress={() => {
                // Navigate to property details
                console.log("Navigate to property:", propertyKey);
              }}
            >
              <Image
                source={
                  firstImage
                    ? { uri: firstImage }
                    : require("../../../assets/images/ScreensImages/ProfileComplete.png")
                }
                style={ProfileStyles.propertyGridImage}
                onError={(error) => {
                  console.error(
                    `❌ Failed to load image for property ${propertyKey}:`,
                    error.nativeEvent.error
                  );
                }}
                onLoad={() => {
                  console.log(
                    `✅ Successfully loaded image for property ${propertyKey}: ${firstImage}`
                  );
                }}
              />
              {/* Optional: Show property status badge */}
              {property.status !== "active" && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}
                  >
                    {property.status?.toUpperCase() || "ACTIVE"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[GlobalStyles.container, { paddingHorizontal: 0 }]}>
      <ScrollView
        style={ProfileStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image */}
        <View style={ProfileStyles.headerContainer}>
          <Image
            source={require("../../../assets/images/ScreensImages/ProfileComplete.png")}
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
            <TouchableOpacity style={ProfileStyles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Profile image positioned at bottom of header */}
          <View style={ProfileStyles.profileImageWrapper}>
            <View style={ProfileStyles.profileImageContainer}>
              <Image
                source={require("../../../assets/sam b.png")}
                style={ProfileStyles.profileImage}
              />
            </View>
          </View>
        </View>
        {/* Profile Info Section */}
        <View style={ProfileStyles.profileSection}>
          <Text style={ProfileStyles.profileName}>Mohamed Mohsen</Text>
          <View style={ProfileStyles.locationContainer}>
            <Ionicons name="location" size={16} color="#666666" />
            <Text style={ProfileStyles.locationText}>
              {t("profile.location")}
            </Text>
          </View>

          {/* Stats Section */}
          <View style={ProfileStyles.statsContainer}>
            <View style={ProfileStyles.statItem}>
              <Text style={ProfileStyles.statNumber}>122</Text>
              <Text style={ProfileStyles.statLabel}>
                {t("profile.followers")}
              </Text>
            </View>
            <View style={ProfileStyles.statItem}>
              <Text style={ProfileStyles.statNumber}>4,5</Text>
              <Text style={ProfileStyles.statLabel}>{t("profile.rating")}</Text>
            </View>
            <View style={ProfileStyles.statItem}>
              <Text style={ProfileStyles.statNumber}>37</Text>
              <Text style={ProfileStyles.statLabel}>
                {t("profile.soldRent")}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={ProfileStyles.actionButtons}>
            {isSeller ? (
              // Seller: Edit Profile + Add Item
              <>
                <TouchableOpacity style={ProfileStyles.outlineButton}>
                  <Text style={ProfileStyles.outlineButtonText}>
                    {t("profile.editProfile")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ProfileStyles.filledButton}
                  onPress={() => {
                    // Route to add item screen based on interest
                    if (userInterest === "cars") {
                      router.push("/add-car");
                    } else {
                      router.push("/add-house");
                    }
                  }}
                >
                  <Text style={ProfileStyles.filledButtonText}>
                    {t("profile.addItem")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Buyer: Edit Profile + Logout
              <>
                <TouchableOpacity style={ProfileStyles.outlineButton}>
                  <Text style={ProfileStyles.outlineButtonText}>
                    {t("profile.editProfile")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={ProfileStyles.filledButton}
                  onPress={handleLogout}
                >
                  <Text style={ProfileStyles.filledButtonText}>
                    {t("profile.logout")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tabs Section */}
        <View style={ProfileStyles.tabsContainer}>
          <TouchableOpacity
            style={[
              ProfileStyles.tab,
              activeTab === "available" && ProfileStyles.activeTab,
            ]}
            onPress={() => setActiveTab("available")}
          >
            <Text
              style={[
                ProfileStyles.tabText,
                activeTab === "available" && ProfileStyles.activeTabText,
              ]}
            >
              {t("profile.available")}
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
              {t("profile.reviews")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === "available" ? (
          renderPropertyGrid()
        ) : (
          <View style={ProfileStyles.reviewsContainer}>
            <Text style={ProfileStyles.reviewsText}>
              {t("profile.noReviewsYet")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
