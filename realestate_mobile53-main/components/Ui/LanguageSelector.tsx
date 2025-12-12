import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../styles';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { 
    currentLanguageInfo, 
    supportedLanguages, 
    changeLanguage, 
    t 
  } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    const success = await changeLanguage(languageCode);
    if (success) {
      setShowLanguageModal(false);
      // You might want to show a success message or restart the app
      // For now, the context will handle the language change
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => setShowLanguageModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{t('language')}</Text>
          <View style={styles.selectedLanguage}>
            <Text style={styles.languageText}>
              {currentLanguageInfo.nativeName}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#8A8A8A"
              style={styles.chevron}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <BlurView intensity={50} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={supportedLanguages}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    currentLanguageInfo.code === item.code && styles.selectedLanguageItem,
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <View style={styles.languageItemContent}>
                    <Text style={styles.languageName}>{item.name}</Text>
                    <Text style={styles.languageNativeName}>{item.nativeName}</Text>
                  </View>
                  {currentLanguageInfo.code === item.code && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </BlurView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  selectedLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  selectedLanguageItem: {
    backgroundColor: '#FFF0E6',
  },
  languageItemContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#8A8A8A',
  },
});