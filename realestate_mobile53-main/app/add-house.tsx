import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { BackButton, MapPicker, SuccessModal } from "../components/Ui";
import {
  createProperty,
  uploadPropertyMedia,
} from "../services/propertyService";
import { authService } from "../services/authService";
import { apiService } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import i18n from "../services/i18n";

export default function AddHouseScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [locale, setLocale] = useState(i18n.locale);

  // Listen for language changes - same pattern as _layout.tsx
  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);

    return () => clearInterval(checkLocale);
  }, [locale]);

  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    price: "",
    area: "",
    location: null as { latitude: number; longitude: number } | null,
  });

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAqSchAEdRlw3Rsk17pfI7H4NaWnmiROi4`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const formattedAddress = data.results[0].formatted_address;

        // Try to extract street, city, state
        let street = "";
        let city = "";
        let state = "";

        addressComponents.forEach((component: any) => {
          if (component.types.includes("route")) {
            street = component.long_name;
          }
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        });

        // Format the display: "Street, City, State" or use formatted address
        const displayAddress =
          street && city
            ? `${street}, ${city}${state ? ", " + state : ""}`
            : formattedAddress;

        setLocationAddress(displayAddress);
      } else {
        setLocationAddress("Location selected");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocationAddress("Location selected");
    }
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    setFormData((prev) => ({ ...prev, location }));
    await getAddressFromCoordinates(location.latitude, location.longitude);
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library access to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.bedrooms.trim()) {
      Alert.alert("Error", "Please enter number of bedrooms");
      return;
    }

    if (!formData.location) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user has a valid auth token
      const token = await authService.getStoredToken();
      if (!token) {
        Alert.alert(
          t("addHouse.authRequired"),
          t("addHouse.authRequiredMessage"),
          [
            {
              text: t("addHouse.ok"),
              onPress: () => router.push("/auth/SignIn"),
            },
          ]
        );
        setIsSubmitting(false);
        return;
      }

      // Ensure token is set in API service
      apiService.setAuthToken(token);
      console.log("🔑 Token verification:", {
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + "...",
        apiServiceHasToken: !!apiService.getAuthToken(),
      });

      // Extract city and state from locationAddress
      const addressParts = locationAddress
        .split(",")
        .map((part) => part.trim());
      const city = addressParts[1] || "Unknown City";
      const state = addressParts[2] || "Unknown State";

      // Create property data matching backend structure
      const propertyData = {
        title: formData.title || `Beautiful ${formData.bedrooms} Bedroom House`,
        description: formData.description || "A wonderful property",
        type: "house" as const, // Backend enum: 'apartment', 'house', 'commercial', 'land', 'office'
        listingType: "rent" as const, // Backend enum: 'sale', 'rent'
        propertyDetails: {
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          area: parseFloat(formData.area) || 100,
          areaUnit: "sqm" as const, // Backend enum: 'sqft', 'sqm'
        },
        location: {
          address: locationAddress,
          city: city,
          state: state,
          country: "Tunisia",
          coordinates: {
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
          },
        },
        pricing: {
          rentPrice: parseFloat(formData.price) || 0,
          rentPeriod: "monthly" as const, // Backend enum: 'daily', 'weekly', 'monthly', 'yearly'
          currency: "DT",
          negotiable: true,
        },
        status: "active" as const, // Backend enum: 'active', 'inactive', 'sold', 'rented', 'pending'
      };

      console.log("📤 Creating property:", propertyData);

      // Create property
      const createdProperty = await createProperty(propertyData);

      // Backend returns 'id', but we also support '_id' for backwards compatibility
      const propertyId = createdProperty.id || createdProperty._id;
      console.log("✅ Property created successfully. Property ID:", propertyId);
      console.log("📋 Full response data:", createdProperty);

      // Validate property ID before attempting image upload
      if (!propertyId || propertyId === "undefined" || propertyId === "null") {
        console.error(
          "❌ Property ID is missing in response:",
          createdProperty
        );
        throw new Error(
          "Property created but ID is missing. Please try uploading images later."
        );
      }

      // Upload images if property was created
      if (selectedImages.length > 0) {
        const formDataImages = new FormData();
        selectedImages.forEach((image, index) => {
          const imageFile = {
            uri: image.uri,
            type: "image/jpeg",
            name: `property_${index}.jpg`,
          } as any;
          formDataImages.append("images", imageFile);
        });

        try {
          console.log("📤 Uploading images for property:", propertyId);
          await uploadPropertyMedia(propertyId, formDataImages);
          console.log("✅ Images uploaded successfully");
        } catch (imageError) {
          console.error("⚠️ Failed to upload images:", imageError);
          // Continue even if image upload fails
          Alert.alert(
            "Warning",
            "Property created successfully, but some images failed to upload. You can add them later."
          );
        }
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Error creating property:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BackButton onPress={() => router.back()} color="#A0A09E" />
        </View>
        <Text style={styles.headerTitle}>{t("addHouse.title")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.formTitle")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("addHouse.titlePlaceholder")}
            value={formData.title}
            onChangeText={(text) => updateFormData("title", text)}
          />
        </View>

        {/* Bedrooms */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.bedrooms")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("addHouse.bedroomsPlaceholder")}
            value={formData.bedrooms}
            onChangeText={(text) => updateFormData("bedrooms", text)}
            keyboardType="numeric"
          />
        </View>

        {/* Bathrooms */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.bathrooms")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("addHouse.bathroomsPlaceholder")}
            value={formData.bathrooms}
            onChangeText={(text) => updateFormData("bathrooms", text)}
            keyboardType="numeric"
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.description")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("addHouse.descriptionPlaceholder")}
            value={formData.description}
            onChangeText={(text) => updateFormData("description", text)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Price */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.pricePerMonth")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("addHouse.pricePlaceholder")}
            value={formData.price}
            onChangeText={(text) => updateFormData("price", text)}
            keyboardType="numeric"
          />
        </View>

        {/* Area */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.area")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("addHouse.areaPlaceholder")}
            value={formData.area}
            onChangeText={(text) => updateFormData("area", text)}
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("addHouse.location")}</Text>
          <TouchableOpacity
            style={[
              styles.locationButton,
              formData.location && styles.locationButtonWithMap,
            ]}
            onPress={() => setShowMapPicker(true)}
          >
            {formData.location ? (
              <View style={styles.mapPreviewContainer}>
                <MapView
                  style={styles.mapPreview}
                  provider={PROVIDER_GOOGLE}
                  region={{
                    latitude: formData.location.latitude,
                    longitude: formData.location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  pointerEvents="none"
                >
                  <Marker
                    coordinate={{
                      latitude: formData.location.latitude,
                      longitude: formData.location.longitude,
                    }}
                  />
                </MapView>
                <View style={styles.mapOverlay}>
                  <Ionicons name="location" size={16} color="#FF6B35" />
                  <Text style={styles.mapOverlayText} numberOfLines={1}>
                    {locationAddress || t("addHouse.loadingAddress")}
                  </Text>
                  <Ionicons
                    name="pencil"
                    size={14}
                    color="#666"
                    style={styles.editIcon}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.locationPlaceholder}>
                <Ionicons name="map-outline" size={20} color="#999999" />
                <Text style={styles.locationPlaceholderText}>
                  {t("addHouse.selectLocationOnMap")}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Upload image button */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
          <Ionicons name="add" size={32} color="#FF6B35" />
          <Text style={styles.uploadText}>{t("addHouse.uploadImage")}</Text>
          {selectedImages.length > 0 && (
            <Text style={styles.imageCount}>
              {selectedImages.length} {t("addHouse.imagesSelected")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Display selected images */}
        {selectedImages.length > 0 && (
          <View style={styles.imageGrid}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Item button */}
        <TouchableOpacity
          style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t("addHouse.creating")}</Text>
            </View>
          ) : (
            <Text style={styles.addButtonText}>{t("addHouse.addItem")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={formData.location || undefined}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={t("addHouse.successTitle")}
        message={t("addHouse.successMessage")}
        buttonText={t("addHouse.viewProperties")}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/(tabs)/Explore");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Raleway-Bold",
    color: "#FF6B35",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginTop: 24,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: "Raleway-SemiBold",
    color: "#FF6B35",
    zIndex: 1,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Raleway",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#999999",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 24,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: "Raleway-SemiBold",
    color: "#FF6B35",
    marginTop: 8,
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
  },
  addButtonDisabled: {
    backgroundColor: "#FFB399",
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addButtonText: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    color: "#FFFFFF",
  },
  imageCount: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#666666",
    marginTop: 8,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  imageContainer: {
    width: "31%",
    aspectRatio: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 48,
    justifyContent: "center",
    overflow: "hidden",
  },
  locationButtonWithMap: {
    padding: 0,
    minHeight: 120,
  },
  mapPreviewContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  mapPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  mapOverlayText: {
    fontSize: 12,
    fontFamily: "Raleway-Medium",
    color: "#333333",
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
  },
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCoordinate: {
    fontSize: 13,
    fontFamily: "Raleway",
    color: "#333333",
    marginBottom: 2,
  },
  locationPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationPlaceholderText: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#999999",
  },
});
