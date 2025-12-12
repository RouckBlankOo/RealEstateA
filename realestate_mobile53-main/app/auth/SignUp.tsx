import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenLayout, SelectionButton } from "../../components/Ui";
import i18n, { t } from "../../services/i18n";

type UserType = "buyer" | "seller" | null;

const SignUpScreen = () => {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [locale, setLocale] = useState(i18n.locale);

  React.useEffect(() => {
    const checkLocale = setInterval(() => {
      if (i18n.locale !== locale) {
        setLocale(i18n.locale);
      }
    }, 100);
    return () => clearInterval(checkLocale);
  }, [locale]);

  const handleBuyerSignUp = () => {
    setSelectedUserType("buyer");
    router.push("/auth/ChooseInterest?userType=buyer");
  };

  const handleSellerSignUp = () => {
    setSelectedUserType("seller");
    router.push("/auth/ChooseInterest?userType=seller");
  };

  return (
    <ScreenLayout title={t("authentication.signUpAs")}>
      <SelectionButton
        title={t("authentication.buyer")}
        onPress={handleBuyerSignUp}
        variant={selectedUserType === "buyer" ? "primary" : "secondary"}
      />

      <SelectionButton
        title={t("authentication.seller")}
        onPress={handleSellerSignUp}
        variant={selectedUserType === "seller" ? "primary" : "secondary"}
      />
    </ScreenLayout>
  );
};

export default SignUpScreen;
