import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BookingCard, ScreenWrapper } from "../../components/Ui";
import { useLanguage } from "../../contexts/LanguageContext";
import { useInterest } from "../../contexts/InterestContext";

export default function BookingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userInterest, refreshPreferences } = useInterest();

  // Refresh preferences when screen gains focus (important after login)
  React.useEffect(() => {
    console.log("📍 Bookings screen mounted - refreshing preferences");
    refreshPreferences();
  }, [refreshPreferences]);

  const bookings = useMemo(() => {
    if (userInterest === "cars") {
      return [
        {
          id: 1,
          propertyName: "BMW i5",
          propertyImage: require("../../assets/images/Cars/Bmx6.webp"),
          location: "Aheckhamel",
          price: "300DT",
          status: t("bookings.completed"),
        },
        {
          id: 2,
          propertyName: "Mercedes-Benz S-Class",
          propertyImage: require("../../assets/images/Cars/Mercedes-Benz.jpg"),
          location: "1KW away",
          price: "450DT",
          status: t("bookings.pending"),
        },
      ];
    } else {
      return [
        {
          id: 1,
          propertyName: t("bookings.sampleProperty1"),
          propertyImage: require("../../assets/images/Auth/Appartment.png"),
          location: t("bookings.sampleLocation"),
          price: "180DT",
          status: t("bookings.completed"),
        },
        {
          id: 2,
          propertyName: t("bookings.sampleProperty2"),
          propertyImage: require("../../assets/images/Auth/Appartment.png"),
          location: t("bookings.sampleLocation"),
          price: "2500DT",
          status: t("bookings.pending"),
        },
      ];
    }
  }, [userInterest, t]);

  const handleMenuPress = () => {
    console.log("Menu pressed");
  };

  const handleNotificationPress = () => {
    console.log("Notification pressed");
  };

  const handleTogglePress = () => {
    console.log("Toggle pressed");
  };

  const handleBookingPress = (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      router.push({
        pathname: "../booking-details",
        params: {
          propertyName: booking.propertyName,
          location: booking.location,
          price: booking.price,
          status: booking.status,
        },
      });
    }
  };

  const handleStatusPress = (bookingId: number) => {
    console.log("Status pressed:", bookingId);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <View style={styles.menuIconContainer}>
              <Image
                source={require("../../assets/Icons/IC_Filter.png")}
                style={styles.filterIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotificationPress}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#333333"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleTogglePress}
            >
              <View style={styles.toggleContainer}>
                <View style={styles.toggleSwitch}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              propertyName={booking.propertyName}
              propertyImage={booking.propertyImage}
              location={booking.location}
              price={booking.price}
              status={booking.status}
              onPress={() => handleBookingPress(booking.id)}
              onStatusPress={() => handleStatusPress(booking.id)}
            />
          ))}
        </ScrollView>
      </View>
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
  menuButton: {
    padding: 5,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF8C42",
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
