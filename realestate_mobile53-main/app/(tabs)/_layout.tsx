import { Tabs } from "expo-router";
import { Image } from "react-native";
import { useState, useEffect } from "react";
import i18n, { t } from "../../services/i18n";
import { useInterest } from "../../contexts/InterestContext";

export default function TabLayout() {
  const [locale, setLocale] = useState(i18n.locale);
  const { userInterest, isPropertyMode } = useInterest();

  // Listen for language changes
  useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);

    return () => clearInterval(checkLocale);
  }, [locale]);

  return (
    <Tabs
      key={`${locale}-${userInterest}`} // Force re-render when locale or interest changes
      screenOptions={{
        tabBarActiveTintColor: "#FF8C42",
        tabBarInactiveTintColor: "#A0A0A0",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F8F7F3CB",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="Messages"
        options={{
          title: t("navigation.messages"),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/Icons/Message.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#FF8C42" : "#A0A0A0",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
          title: isPropertyMode
            ? t("navigation.explore")
            : t("navigation.browse_cars"),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/Icons/explore_Active.png")
                  : require("../../assets/Icons/explore.png")
              }
              style={{
                width: 24,
                height: 24,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Settings"
        options={{
          title: t("navigation.settings"),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/Icons/Vector.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#FF8C42" : "#A0A0A0",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Bookings"
        options={{
          title: isPropertyMode
            ? t("navigation.bookings")
            : t("navigation.test_drives"),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/Icons/list_alt_Active.png")
                  : require("../../assets/Icons/list_alt.png")
              }
              style={{
                width: 24,
                height: 24,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("navigation.profile"),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/Icons/account_circle_Active.png")
                  : require("../../assets/Icons/account_circle.png")
              }
              style={{
                width: 24,
                height: 24,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
