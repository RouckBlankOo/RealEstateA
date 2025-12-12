import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { InterestProvider } from "../contexts/InterestContext";
import {
  useFonts,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Comfortaa_400Regular,
  Comfortaa_500Medium,
} from "@expo-google-fonts/comfortaa";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway: Raleway_400Regular,
    "Raleway-Medium": Raleway_500Medium,
    "Raleway-SemiBold": Raleway_600SemiBold,
    "Raleway-Bold": Raleway_700Bold,
    "raleway-400Regular": Raleway_400Regular,
    "raleway-500Medium": Raleway_500Medium,
    "comfortaa-400Regular": Comfortaa_400Regular,
    "comfortaa-500Medium": Comfortaa_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <InterestProvider>
            <StatusBar
              style="dark"
              backgroundColor="#FFFFFF"
              translucent={true}
            />
            <Stack
              screenOptions={{
                headerShown: false, // Hide header for all screens globally
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="onboarding/SignIn" />
              <Stack.Screen name="onboarding/SignUp" />
              <Stack.Screen name="onboarding/ForgotPassword" />
              <Stack.Screen name="onboarding/ResetPassword" />
              <Stack.Screen name="onboarding/VerifyPassword" />
            </Stack>
          </InterestProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
