import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import fr from './locales/fr';
import ar from './locales/ar';

// Initialize i18n
const i18n = new I18n({
  en,
  fr,
  ar,
});

// Set default locale to English
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = '@RealEstate:language';

// Supported locales
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

// Initialize language from storage or device locale
export const initializeLanguage = async () => {
  try {
    // Try to get saved language from storage
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (savedLanguage && SUPPORTED_LOCALES.some(locale => locale.code === savedLanguage)) {
      i18n.locale = savedLanguage;
    } else {
      // Use device locale as fallback
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
      const supportedLocale = SUPPORTED_LOCALES.find(locale => locale.code === deviceLocale);
      i18n.locale = supportedLocale ? deviceLocale : 'en';
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'en';
  }
};

// Change language and persist to storage
export const changeLanguage = async (languageCode: string) => {
  try {
    if (SUPPORTED_LOCALES.some(locale => locale.code === languageCode)) {
      i18n.locale = languageCode;
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.locale;

// Get current language info
export const getCurrentLanguageInfo = () => {
  return SUPPORTED_LOCALES.find(locale => locale.code === i18n.locale) || SUPPORTED_LOCALES[0];
};

// Check if current language is RTL
export const isRTL = () => i18n.locale === 'ar';

// Translation function
export const t = (key: string, options?: any) => i18n.t(key, options);

export default i18n;