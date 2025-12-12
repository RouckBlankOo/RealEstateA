import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenLayout, SelectionButton } from "../../components/Ui";
import i18n, { t } from "../../services/i18n";

type InterestOption = "cars" | "property" | null;
type UserType = "buyer" | "seller";

const ChooseInterestScreen = () => {
  const router = useRouter();
  const { userType } = useLocalSearchParams<{ userType: UserType }>();
  const [selectedOption, setSelectedOption] = useState<InterestOption>(null);
  const [locale, setLocale] = useState(i18n.locale);

  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);
    return () => clearInterval(checkLocale);
  }, [locale]);

  const handleCarsSelection = () => {
    console.log("Cars selected for", userType);
    setSelectedOption("cars");
    // Navigate to appropriate signup form based on user type
    if (userType === "seller") {
      router.push({
        pathname: "/auth/SellerSignUp",
        params: { interest: "cars" },
      });
    } else {
      router.push({
        pathname: "/auth/BuyerSignUp",
        params: { interest: "cars" },
      });
    }
  };

  const handlePropertySelection = () => {
    console.log("Property selected for", userType);
    setSelectedOption("property");
    // Navigate to appropriate signup form based on user type
    if (userType === "seller") {
      router.push({
        pathname: "/auth/SellerSignUp",
        params: { interest: "property" },
      });
    } else {
      router.push({
        pathname: "/auth/BuyerSignUp",
        params: { interest: "property" },
      });
    }
  };

  return (
    <ScreenLayout
      title={
        userType === "seller"
          ? t("authentication.chooseInterestSeller")
          : t("authentication.chooseInterestBuyer")
      }
    >
      <View style={styles.buttonContainer}>
        <SelectionButton
          title={t("authentication.cars")}
          onPress={handleCarsSelection}
          variant={selectedOption === "cars" ? "primary" : "secondary"}
        />

        <SelectionButton
          title={t("authentication.property")}
          onPress={handlePropertySelection}
          variant={selectedOption === "property" ? "primary" : "secondary"}
          style={styles.lastButton}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  lastButton: {
    marginBottom: 0,
  },
});

export default ChooseInterestScreen;
