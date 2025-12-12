import React, { useMemo, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SearchBar,
  FilterChip,
  PropertyCard,
  ScreenWrapper,
} from "../../components/Ui";
import { LoadingOverlay } from "../../components/Ui/LoadingOverlay";
import { useLanguage } from "../../contexts/LanguageContext";
import { useInterest } from "../../contexts/InterestContext";
import { useAppInitialization } from "../../hooks/useAppInitialization";
import { SCREEN_IMAGES } from "../../services/imagePreloader";
import { searchProperties, Property } from "../../services/propertyService";

export default function ExploreScreen() {
  const { t } = useLanguage();
  const { userInterest, refreshPreferences } = useInterest();
  const { isImagesPreloaded } = useAppInitialization();
  const router = useRouter();

  // State for backend properties
  const [backendProperties, setBackendProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const propertyFilters = useMemo(
    () => [
      t("explore.house"),
      t("explore.apartment"),
      t("explore.hotel"),
      t("explore.villa"),
    ],
    [t]
  );

  const carFilters = useMemo(() => ["Sedan", "SUV", "Truck", "Sports Car"], []);

  const filters = userInterest === "cars" ? carFilters : propertyFilters;

  const [activeFilter, setActiveFilter] = React.useState(() =>
    userInterest === "cars" ? "Sedan" : t("explore.house")
  );
  const [selectedLocation, setSelectedLocation] = React.useState(() =>
    t("governorates.sousse")
  );

  // Refresh preferences when screen gains focus (important after login)
  useEffect(() => {
    console.log("📍 Explore screen mounted - refreshing preferences");
    refreshPreferences();
    if (userInterest !== "cars") {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPreferences, userInterest]);

  // Fetch properties from backend
  const fetchProperties = async () => {
    if (userInterest === "cars") {
      // Don't fetch properties for cars
      return;
    }

    setIsLoadingProperties(true);
    try {
      console.log("  Fetching properties from backend...");
      const response = await searchProperties({
        status: "active", // Backend uses "active" not "available"
        limit: 20,
      });

      // Backend returns { properties, pagination }
      const properties = response.properties || [];
      console.log(`✅ Fetched ${properties.length} properties`);

      // Log properties to check for undefined IDs
      properties.forEach((prop: any, index: number) => {
        if (!prop._id && !prop.id) {
          console.warn(`⚠️ Property at index ${index} has no ID:`, prop);
        }
      });

      setBackendProperties(properties);
    } catch (error) {
      console.error("❌ Error fetching properties:", error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInterest]);

  // Refresh preferences when screen gains focus (important after login)
  useEffect(() => {
    console.log("📍 Explore screen mounted - refreshing preferences");
    refreshPreferences();
  }, [refreshPreferences]);

  // Update active filter when user interest changes
  useEffect(() => {
    console.log(`🎯 User interest changed to: ${userInterest}`);
    if (userInterest === "cars") {
      setActiveFilter("Sedan");
    } else {
      setActiveFilter(t("explore.house"));
    }
  }, [userInterest, t]);
  const [showLocationModal, setShowLocationModal] = React.useState(false);

  // All 24 Tunisian Governorates (translated)
  const tunisianStates = useMemo(
    () => [
      t("governorates.tunis"),
      t("governorates.ariana"),
      t("governorates.ben_arous"),
      t("governorates.manouba"),
      t("governorates.nabeul"),
      t("governorates.zaghouan"),
      t("governorates.bizerte"),
      t("governorates.beja"),
      t("governorates.jendouba"),
      t("governorates.kef"),
      t("governorates.siliana"),
      t("governorates.kairouan"),
      t("governorates.kasserine"),
      t("governorates.sidi_bouzid"),
      t("governorates.sousse"),
      t("governorates.monastir"),
      t("governorates.mahdia"),
      t("governorates.sfax"),
      t("governorates.gafsa"),
      t("governorates.tozeur"),
      t("governorates.kebili"),
      t("governorates.gabes"),
      t("governorates.medenine"),
      t("governorates.tataouine"),
    ],
    [t]
  );

  const carProperties = useMemo(
    () => [
      {
        id: "mock-car-1",
        image: require("../../assets/images/Cars/Bmx6.webp"),
        price: "341 km",
        address: "BMW i5",
        area: "Aheckhamel",
        bedrooms: 450, // Power in kW
        bathrooms: 280, // Max speed in km/h
        distance: "341 km",
      },
      {
        id: "mock-car-2",
        image: require("../../assets/images/Cars/Mercedes-Benz.jpg"),
        price: "432 km",
        address: "Audi A6",
        area: "Aheckhamel",
        bedrooms: 380, // Power in kW
        bathrooms: 250, // Max speed in km/h
        distance: "432 km",
      },
    ],
    []
  );

  const houseProperties = useMemo(
    () => [
      {
        id: "mock-house-1",
        image: require("../../assets/images/ScreensImages/House1.jpg"),
        price: "Rp. 2.500.000.000",
        address: "Jl. Sultan Iskandar Muda",
        area: "Jakarta Selatan",
        bedrooms: 6,
        bathrooms: 4,
        distance: "1.8 km",
      },
      {
        id: "mock-house-2",
        image: require("../../assets/images/ScreensImages/House2.jpg"),
        price: "Rp. 2.300.000.000",
        address: "Jl. Cipete Raya",
        area: "Jakarta Selatan",
        bedrooms: 5,
        bathrooms: 3,
        distance: "2.5 km",
      },
    ],
    []
  );

  // Combine backend properties with mock data
  const properties = useMemo(() => {
    if (userInterest === "cars") {
      return carProperties;
    }

    // Convert backend properties to match the display format
    const backendPropertiesFormatted = backendProperties
      .filter((prop: any) => prop && (prop._id || prop.id)) // Filter out properties without valid IDs
      .map((prop: any, index: number) => {
        // Extract values from nested structure
        const propertyId = prop._id || prop.id;
        const bedrooms = prop.propertyDetails?.bedrooms || 0;
        const bathrooms = prop.propertyDetails?.bathrooms || 0;
        const images = prop.media?.images || [];
        const firstImage = images[0];
        const price = prop.pricing?.rentPrice || prop.pricing?.salePrice || 0;
        const rentPeriod = prop.pricing?.rentPeriod || "month";

        return {
          id: `backend-${propertyId}`,
          image: firstImage
            ? { uri: firstImage }
            : require("../../assets/images/ScreensImages/House1.jpg"),
          price: `${price} DT/${rentPeriod}`,
          address: prop.location?.address || prop.title,
          area: prop.location?.city || prop.location?.state || "",
          bedrooms: bedrooms,
          bathrooms: bathrooms,
          distance: "Near you",
        };
      });

    // Show backend properties first, then mock data
    return [...backendPropertiesFormatted, ...houseProperties];
  }, [userInterest, backendProperties, carProperties, houseProperties]);

  const bestCars = useMemo(
    () => [
      {
        id: "best-car-1",
        image: require("../../assets/images/Cars/Bmx6.webp"),
        title: "BMW i6",
        price: "300DT",
        address: "1KW away!",
        area: "300,000 Km",
        bedrooms: 450, // Power in kW
        bathrooms: 280, // Max speed in km/h
      },
      {
        id: "best-car-2",
        image: require("../../assets/images/Cars/Mercedes-Benz.jpg"),
        title: "Mercedes-Benz S-Class",
        price: "450DT",
        address: "2KW away!",
        area: "250,000 Km",
        bedrooms: 380, // Power in kW
        bathrooms: 250, // Max speed in km/h
      },
    ],
    []
  );

  const bestHouses = useMemo(
    () => [
      {
        id: "best-house-1",
        image: SCREEN_IMAGES.house1,
        title: "Orchad House",
        price: `2.500DT ${t("property.perMonth")}`,
        address: "Jl. Sultan Iskandar Muda",
        area: "Jakarta Selatan",
        bedrooms: 6,
        bathrooms: 4,
      },
      {
        id: "best-house-2",
        image: SCREEN_IMAGES.house2,
        title: "The Hollies House",
        price: `2.300DT ${t("property.perMonth")}`,
        address: "Jl. Cipete Raya",
        area: "Jakarta Selatan",
        bedrooms: 5,
        bathrooms: 3,
      },
    ],
    [t]
  );

  const bestProperties = userInterest === "cars" ? bestCars : bestHouses;

  const handleLocationSelect = useCallback((location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  }, []);

  const handlePropertyPress = useCallback(
    (property: any) => {
      console.log(
        "  Navigating to booking details for property:",
        property.title
      );
      // Navigate to booking details with property information
      router.push({
        pathname: "/booking/booking-details",
        params: {
          propertyId: property.id,
          propertyTitle: property.title,
          propertyPrice: property.price,
          propertyAddress: property.address,
          propertyImage: JSON.stringify(property.image), // Serialize image data
        },
      });
    },
    [router]
  );

  return (
    <ScreenWrapper>
      <LoadingOverlay
        visible={!isImagesPreloaded || isLoadingProperties}
        message={
          isLoadingProperties
            ? "Loading properties..."
            : "Optimizing images for better performance..."
        }
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>{t("explore.location")}</Text>
            <TouchableOpacity
              style={styles.locationDropdown}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={styles.locationText}>{selectedLocation}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#8A8A8A"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#333333"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleSwitch}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar
            placeholder={
              userInterest === "cars"
                ? "Search address, or near you"
                : t("explore.searchPlaceholder")
            }
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userInterest === "cars" ? (
              <View style={styles.carBrandsContainer}>
                {[
                  {
                    name: "BMW",
                    logo: require("../../assets/logo/BMW.png"),
                  },
                  {
                    name: "Audi",
                    logo: require("../../assets/logo/AUDI.png"),
                  },
                  {
                    name: "Mercedes",
                    logo: require("../../assets/images/Auth/Car.png"),
                  },
                  {
                    name: "Ford",
                    logo: require("../../assets/logo/FORD.png"),
                  },
                  {
                    name: "Honda",
                    logo: require("../../assets/images/Auth/Car.png"),
                  },
                ].map((brand) => (
                  <TouchableOpacity
                    key={brand.name}
                    style={[
                      styles.carBrandItem,
                      activeFilter === brand.name && styles.carBrandItemActive,
                    ]}
                    onPress={() => setActiveFilter(brand.name)}
                  >
                    <Image source={brand.logo} style={styles.carBrandLogo} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.filtersContainer}>
                {filters.map((filter) => (
                  <FilterChip
                    key={filter}
                    title={filter}
                    isSelected={activeFilter === filter}
                    onPress={() => setActiveFilter(filter)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Near from you section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userInterest === "cars"
                ? t("explore.nearFromYouCars")
                : t("explore.nearFromYou")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeMore}>{t("explore.seeMore")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.propertyList}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  image={property.image}
                  price={property.price}
                  address={property.address}
                  area={property.area}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  distance={property.distance}
                  mode={userInterest}
                  onPress={() => handlePropertyPress(property)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Best for you section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userInterest === "cars"
                ? t("explore.bestForYouCars")
                : t("explore.bestForYou")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeMore}>{t("explore.seeMore")}</Text>
            </TouchableOpacity>
          </View>
          {bestProperties.map((property) => (
            <PropertyCard
              key={property.id}
              image={property.image}
              title={property.title}
              price={property.price}
              address={property.address}
              area={property.area}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              variant="best"
              mode={userInterest}
              style={styles.bestPropertyCardMargin}
              onPress={() => handlePropertyPress(property)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <BlurView intensity={50} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("explore.selectLocation")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={tunisianStates}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedLocation === item && styles.selectedLocationItem,
                  ]}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Text
                    style={[
                      styles.locationItemText,
                      selectedLocation === item && styles.selectedLocationText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedLocation === item && (
                    <Ionicons name="checkmark" size={20} color="#FF8C42" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </BlurView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  locationLabel: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 4,
    fontFamily: "raleway-400Regular",
  },
  locationDropdown: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 4,
    fontFamily: "raleway-500Medium",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF8C42",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitch: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  filtersSection: {
    marginBottom: 30,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  carBrandsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
  },
  carBrandItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  carBrandItemActive: {
    borderColor: "#FF8C42",
    backgroundColor: "#FFF0E6",
  },
  carBrandLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "raleway-500Medium",
  },
  seeMore: {
    fontSize: 14,
    color: "#858585",
    fontFamily: "raleway-400Regular",
  },
  propertyList: {
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  bestPropertyCardMargin: {
    marginBottom: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    fontFamily: "raleway-500Medium",
  },
  closeButton: {
    padding: 5,
  },
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  selectedLocationItem: {
    backgroundColor: "#FFF0E6",
  },
  locationItemText: {
    fontSize: 16,
    color: "#333333",
    fontFamily: "raleway-400Regular",
  },
  selectedLocationText: {
    color: "#FF8C42",
    fontWeight: "600",
    fontFamily: "raleway-500Medium",
  },
});
