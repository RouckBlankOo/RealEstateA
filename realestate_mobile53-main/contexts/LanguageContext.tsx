import React, { createContext, useContext, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import {
  supportedLanguages,
  setLanguage,
  isRTL as checkIsRTL,
  t,
} from "../services/i18n";

const LANGUAGE_STORAGE_KEY = "user_language";

interface LanguageContextType {
  currentLanguage: string;
  currentLanguageInfo: (typeof supportedLanguages)[0];
  isRTL: boolean;
  supportedLanguages: typeof supportedLanguages;
  changeLanguage: (languageCode: string) => Promise<boolean>;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return (
      supportedLanguages.find((lang) => lang.code === currentLanguage) ||
      supportedLanguages[0]
    );
  };

  // Initialize language on app start
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check for saved language preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        let languageToUse = "en"; // default

        if (
          savedLanguage &&
          supportedLanguages.find((lang) => lang.code === savedLanguage)
        ) {
          languageToUse = savedLanguage;
        } else {
          // Use device language if supported
          const deviceLanguage =
            Localization.getLocales()[0]?.languageCode || "en";
          if (supportedLanguages.find((lang) => lang.code === deviceLanguage)) {
            languageToUse = deviceLanguage;
          }
        }

        // Set the language
        setLanguage(languageToUse);
        setCurrentLanguage(languageToUse);

        // Handle RTL
        const isRTLLang = checkIsRTL();
        if (I18nManager.isRTL !== isRTLLang) {
          I18nManager.allowRTL(isRTLLang);
          I18nManager.forceRTL(isRTLLang);
        }
      } catch (error) {
        console.error("Error initializing language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const handleChangeLanguage = async (
    languageCode: string
  ): Promise<boolean> => {
    try {
      if (!supportedLanguages.find((lang) => lang.code === languageCode)) {
        return false;
      }

      // Update i18n
      const success = setLanguage(languageCode);
      if (success) {
        setCurrentLanguage(languageCode);

        // Save to storage
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);

        // Handle RTL
        const isRTLLang = checkIsRTL();
        if (I18nManager.isRTL !== isRTLLang) {
          I18nManager.allowRTL(isRTLLang);
          I18nManager.forceRTL(isRTLLang);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error changing language:", error);
      return false;
    }
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    currentLanguageInfo: getCurrentLanguageInfo(),
    isRTL: checkIsRTL(),
    supportedLanguages,
    changeLanguage: handleChangeLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
