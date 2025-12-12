import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { HeaderWithBackButton } from "@/components/Ui/HeaderWithBackButton";
import { getProperty } from "@/services/propertyService";

export default function EditPropertyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) {
      Alert.alert("Error", "Property ID is required");
      router.back();
      return;
    }

    const loadPropertyData = async () => {
      try {
        const property = await getProperty(propertyId);
        console.log("Property loaded:", property);
        setLoading(false);
      } catch (error: any) {
        console.error("Error loading property:", error);
        Alert.alert("Error", "Failed to load property details", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    };

    loadPropertyData();
  }, [propertyId, router]);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderWithBackButton onBackPress={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading property...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderWithBackButton onBackPress={() => router.back()} />
        <Text style={styles.headerTitle}>Edit Property</Text>
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.comingSoonText}>
          Edit functionality coming soon!
        </Text>
        <Text style={styles.noteText}>
          For now, you can delete and recreate the property with updated
          information.
        </Text>
      </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Raleway",
    color: "#666",
    marginTop: 16,
  },
  comingSoonText: {
    fontSize: 20,
    fontFamily: "Raleway-Bold",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  noteText: {
    fontSize: 16,
    fontFamily: "Raleway",
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
