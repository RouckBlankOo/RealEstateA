import React, { useState, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { HeaderWithBackButton } from "@/components/Ui/HeaderWithBackButton";
import { SuccessModal } from "@/components/Ui";
import {
  createPropertyWithMedia,
  type CreatePropertyData,
} from "@/services/propertyService";
import { useInterest } from "@/contexts/InterestContext";

const PROPERTY_TYPES = [
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Commercial", value: "commercial" },
  { label: "Land", value: "land" },
  { label: "Office", value: "office" },
];

const LISTING_TYPES = [
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
];

const AREA_UNITS = [
  { label: "Square Feet", value: "sqft" },
  { label: "Square Meters", value: "sqm" },
];

const FURNISHING_OPTIONS = [
  { label: "Furnished", value: "furnished" },
  { label: "Semi-Furnished", value: "semi-furnished" },
  { label: "Unfurnished", value: "unfurnished" },
];

const RENT_PERIODS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const COMMON_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Garden",
  "Elevator",
  "Power Backup",
  "Wi-Fi",
  "AC",
  "Balcony",
];

const COMMON_FEATURES = [
  "Pet Friendly",
  "Gated Community",
  "Near Metro",
  "Corner Property",
  "Vastu Compliant",
  "Newly Constructed",
  "Green Building",
];

export default function AddPropertyScreen() {
  const router = useRouter();
  const { isSeller } = useInterest();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);

  // Redirect if user is not a seller
  useEffect(() => {
    if (!isSeller) {
      Alert.alert("Access Denied", "Only sellers can add properties.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/Explore") },
      ]);
    }
  }, [isSeller, router]);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    description: "",
    type: "apartment" as
      | "apartment"
      | "house"
      | "commercial"
      | "land"
      | "office",
    listingType: "sale" as "sale" | "rent",

    // Step 2: Property Details
    bedrooms: "",
    bathrooms: "",
    area: "",
    areaUnit: "sqft" as "sqft" | "sqm",
    parking: "",
    furnishing: "unfurnished" as "furnished" | "semi-furnished" | "unfurnished",
    amenities: [] as string[],
    age: "",
    floor: "",
    totalFloors: "",

    // Step 3: Location
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    landmark: "",
    latitude: "",
    longitude: "",

    // Step 4: Pricing
    salePrice: "",
    rentPrice: "",
    rentPeriod: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    deposit: "",
    maintenanceCharges: "",
    currency: "USD",
    priceNegotiable: false,

    // Step 5: Additional
    features: [] as string[],
    rules: [] as string[],
    newRule: "",
    availableFrom: "",
    availableTo: "",
  });

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: "amenities" | "features", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const addRule = () => {
    if (formData.newRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, prev.newRule.trim()],
        newRule: "",
      }));
    }
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
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
      selectionLimit: 20,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert("Error", "Please enter a property title");
          return false;
        }
        if (!formData.description.trim()) {
          Alert.alert("Error", "Please enter a description");
          return false;
        }
        return true;

      case 2:
        // Property details are optional but validate if provided
        if (formData.area && isNaN(parseFloat(formData.area))) {
          Alert.alert("Error", "Please enter a valid area");
          return false;
        }
        return true;

      case 3:
        if (!formData.address.trim()) {
          Alert.alert("Error", "Please enter an address");
          return false;
        }
        if (!formData.city.trim()) {
          Alert.alert("Error", "Please enter a city");
          return false;
        }
        if (!formData.country.trim()) {
          Alert.alert("Error", "Please enter a country");
          return false;
        }
        return true;

      case 4:
        if (selectedImages.length === 0) {
          Alert.alert("Error", "Please add at least one image");
          return false;
        }
        return true;

      case 5:
        if (formData.listingType === "sale" && !formData.salePrice) {
          Alert.alert("Error", "Please enter sale price");
          return false;
        }
        if (formData.listingType === "rent" && !formData.rentPrice) {
          Alert.alert("Error", "Please enter rent price");
          return false;
        }
        if (formData.salePrice && isNaN(parseFloat(formData.salePrice))) {
          Alert.alert("Error", "Please enter a valid sale price");
          return false;
        }
        if (formData.rentPrice && isNaN(parseFloat(formData.rentPrice))) {
          Alert.alert("Error", "Please enter a valid rent price");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);

    try {
      const propertyData: CreatePropertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        listingType: formData.listingType,
        propertyDetails: {
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms
            ? parseInt(formData.bathrooms)
            : undefined,
          area: formData.area ? parseFloat(formData.area) : undefined,
          areaUnit: formData.areaUnit,
          parking: formData.parking ? parseInt(formData.parking) : undefined,
          furnishing: formData.furnishing,
          amenities:
            formData.amenities.length > 0 ? formData.amenities : undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          totalFloors: formData.totalFloors
            ? parseInt(formData.totalFloors)
            : undefined,
        },
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim() || undefined,
          country: formData.country.trim(),
          zipCode: formData.zipCode.trim() || undefined,
          landmark: formData.landmark.trim() || undefined,
          coordinates:
            formData.latitude && formData.longitude
              ? {
                  latitude: parseFloat(formData.latitude),
                  longitude: parseFloat(formData.longitude),
                }
              : undefined,
        },
        pricing: {
          salePrice: formData.salePrice
            ? parseFloat(formData.salePrice)
            : undefined,
          rentPrice: formData.rentPrice
            ? parseFloat(formData.rentPrice)
            : undefined,
          rentPeriod:
            formData.listingType === "rent" ? formData.rentPeriod : undefined,
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          maintenanceCharges: formData.maintenanceCharges
            ? parseFloat(formData.maintenanceCharges)
            : undefined,
          currency: formData.currency,
          priceNegotiable: formData.priceNegotiable,
        },
        availability: {
          isAvailable: true,
          availableFrom: formData.availableFrom || undefined,
          availableTo: formData.availableTo || undefined,
        },
        features: formData.features.length > 0 ? formData.features : undefined,
        rules: formData.rules.length > 0 ? formData.rules : undefined,
      };

      const mediaFiles = {
        images: selectedImages.map((image, index) => ({
          uri: image.uri,
          type: "image/jpeg",
          name: `property_${Date.now()}_${index}.jpg`,
        })),
      };

      await createPropertyWithMedia(propertyData, mediaFiles);

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error creating property:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create property. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {step}
            </Text>
          </View>
          {step < 6 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <Text style={styles.label}>
        Property Title <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Modern 3BHK Apartment"
        value={formData.title}
        onChangeText={(text) => updateFormData("title", text)}
      />

      <Text style={styles.label}>
        Description <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your property..."
        value={formData.description}
        onChangeText={(text) => updateFormData("description", text)}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>
        Property Type <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.chipContainer}>
        {PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.chip,
              formData.type === type.value && styles.chipSelected,
            ]}
            onPress={() => updateFormData("type", type.value)}
          >
            <Text
              style={[
                styles.chipText,
                formData.type === type.value && styles.chipTextSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Listing Type <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.chipContainer}>
        {LISTING_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.chip,
              formData.listingType === type.value && styles.chipSelected,
            ]}
            onPress={() => updateFormData("listingType", type.value)}
          >
            <Text
              style={[
                styles.chipText,
                formData.listingType === type.value && styles.chipTextSelected,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Property Details</Text>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bedrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.bedrooms}
            onChangeText={(text) => updateFormData("bedrooms", text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bathrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.bathrooms}
            onChangeText={(text) => updateFormData("bathrooms", text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Area</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.area}
            onChangeText={(text) => updateFormData("area", text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.chipContainer}>
            {AREA_UNITS.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={[
                  styles.chipSmall,
                  formData.areaUnit === unit.value && styles.chipSelected,
                ]}
                onPress={() => updateFormData("areaUnit", unit.value)}
              >
                <Text
                  style={[
                    styles.chipTextSmall,
                    formData.areaUnit === unit.value && styles.chipTextSelected,
                  ]}
                >
                  {unit.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Parking Spaces</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.parking}
            onChangeText={(text) => updateFormData("parking", text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Property Age (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.age}
            onChangeText={(text) => updateFormData("age", text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Furnishing</Text>
      <View style={styles.chipContainer}>
        {FURNISHING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              formData.furnishing === option.value && styles.chipSelected,
            ]}
            onPress={() => updateFormData("furnishing", option.value)}
          >
            <Text
              style={[
                styles.chipText,
                formData.furnishing === option.value && styles.chipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Amenities</Text>
      <View style={styles.chipContainer}>
        {COMMON_AMENITIES.map((amenity) => (
          <TouchableOpacity
            key={amenity}
            style={[
              styles.chip,
              formData.amenities.includes(amenity) && styles.chipSelected,
            ]}
            onPress={() => toggleArrayItem("amenities", amenity)}
          >
            <Text
              style={[
                styles.chipText,
                formData.amenities.includes(amenity) && styles.chipTextSelected,
              ]}
            >
              {amenity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>

      <Text style={styles.label}>
        Address <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Street address"
        value={formData.address}
        onChangeText={(text) => updateFormData("address", text)}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>
            City <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => updateFormData("city", text)}
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>State/Province</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            value={formData.state}
            onChangeText={(text) => updateFormData("state", text)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>
            Country <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Country"
            value={formData.country}
            onChangeText={(text) => updateFormData("country", text)}
          />
        </View>

        <View style={styles.halfWidth}>
          <Text style={styles.label}>Zip/Postal Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Zip code"
            value={formData.zipCode}
            onChangeText={(text) => updateFormData("zipCode", text)}
          />
        </View>
      </View>

      <Text style={styles.label}>Landmark</Text>
      <TextInput
        style={styles.input}
        placeholder="Nearby landmark"
        value={formData.landmark}
        onChangeText={(text) => updateFormData("landmark", text)}
      />

      <Text style={styles.label}>Coordinates (Optional)</Text>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={formData.latitude}
            onChangeText={(text) => updateFormData("latitude", text)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={formData.longitude}
            onChangeText={(text) => updateFormData("longitude", text)}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        Property Images <Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
        <Ionicons name="images-outline" size={32} color="#007AFF" />
        <Text style={styles.uploadButtonText}>Select Images</Text>
        <Text style={styles.uploadButtonSubtext}>
          {selectedImages.length}/20 selected
        </Text>
      </TouchableOpacity>

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
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pricing</Text>

      {formData.listingType === "sale" && (
        <>
          <Text style={styles.label}>
            Sale Price <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.salePrice}
            onChangeText={(text) => updateFormData("salePrice", text)}
            keyboardType="numeric"
          />
        </>
      )}

      {formData.listingType === "rent" && (
        <>
          <Text style={styles.label}>
            Rent Price <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.rentPrice}
            onChangeText={(text) => updateFormData("rentPrice", text)}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Rent Period</Text>
          <View style={styles.chipContainer}>
            {RENT_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.chip,
                  formData.rentPeriod === period.value && styles.chipSelected,
                ]}
                onPress={() => updateFormData("rentPeriod", period.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.rentPeriod === period.value &&
                      styles.chipTextSelected,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Security Deposit</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={formData.deposit}
            onChangeText={(text) => updateFormData("deposit", text)}
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.label}>Maintenance Charges</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={formData.maintenanceCharges}
        onChangeText={(text) => updateFormData("maintenanceCharges", text)}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() =>
          updateFormData("priceNegotiable", !formData.priceNegotiable)
        }
      >
        <Ionicons
          name={formData.priceNegotiable ? "checkbox" : "square-outline"}
          size={24}
          color="#007AFF"
        />
        <Text style={styles.checkboxLabel}>Price Negotiable</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Details & Review</Text>

      <Text style={styles.label}>Features</Text>
      <View style={styles.chipContainer}>
        {COMMON_FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.chip,
              formData.features.includes(feature) && styles.chipSelected,
            ]}
            onPress={() => toggleArrayItem("features", feature)}
          >
            <Text
              style={[
                styles.chipText,
                formData.features.includes(feature) && styles.chipTextSelected,
              ]}
            >
              {feature}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Property Rules</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Add a rule"
          value={formData.newRule}
          onChangeText={(text) => updateFormData("newRule", text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addRule}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {formData.rules.map((rule, index) => (
        <View key={index} style={styles.ruleItem}>
          <Text style={styles.ruleText}>• {rule}</Text>
          <TouchableOpacity onPress={() => removeRule(index)}>
            <Ionicons name="close" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>Review Your Listing</Text>
        <Text style={styles.reviewText}>Title: {formData.title}</Text>
        <Text style={styles.reviewText}>Type: {formData.type}</Text>
        <Text style={styles.reviewText}>
          Location: {formData.city}, {formData.country}
        </Text>
        <Text style={styles.reviewText}>Images: {selectedImages.length}</Text>
        <Text style={styles.reviewText}>
          Price:{" "}
          {formData.listingType === "sale"
            ? `$${formData.salePrice}`
            : `$${formData.rentPrice}/${formData.rentPeriod}`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Create Property Listing</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderWithBackButton onBackPress={() => router.back()} />
        <Text style={styles.headerTitle}>Add Property</Text>
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </ScrollView>

      {currentStep < 6 && (
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.navButton} onPress={prevStep}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={nextStep}
          >
            <Text style={styles.navButtonTextPrimary}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Success!"
        message="Property created successfully!"
        buttonText="View Properties"
        onClose={() => {
          setShowSuccessModal(false);
          router.replace("/(tabs)/Explore");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    marginTop: -30,
    color: "#1A1A1A",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "white",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#007AFF",
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: "Comfortaa",
    color: "#666",
  },
  stepNumberActive: {
    color: "white",
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  stepLineActive: {
    backgroundColor: "#007AFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Raleway-Bold",
    marginBottom: 20,
    color: "#1A1A1A",
  },
  label: {
    fontSize: 16,
    fontFamily: "Raleway-SemiBold",
    marginBottom: 8,
    marginTop: 16,
    color: "#333",
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Raleway",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#666",
  },
  chipTextSelected: {
    color: "white",
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  chipTextSmall: {
    fontSize: 12,
    fontFamily: "Raleway",
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  uploadButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    marginTop: 10,
  },
  uploadButtonText: {
    fontSize: 18,
    fontFamily: "Raleway-SemiBold",
    color: "#007AFF",
    marginTop: 10,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#666",
    marginTop: 5,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: "Raleway",
    marginLeft: 8,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  ruleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  ruleText: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#333",
    flex: 1,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  reviewText: {
    fontSize: 14,
    fontFamily: "Raleway",
    color: "#666",
    marginVertical: 4,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    color: "white",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  navButtonPrimary: {
    backgroundColor: "#007AFF",
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: "Raleway-SemiBold",
    color: "#007AFF",
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontFamily: "Raleway-SemiBold",
    color: "white",
  },
});
