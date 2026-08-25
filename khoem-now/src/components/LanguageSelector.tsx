import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEI_LANGUAGES, KEILanguage } from '../utils/languages';
import { colors } from '../utils/colors';
import { radius, fontSize } from '../utils/dimensions';

const LANGUAGE_STORAGE_KEY = '@kei_language';

export interface LanguageSelectorProps {
  value?: string; // a KEILanguage.id, e.g. "en-US"
  onChange?: (id: string) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>(value || 'km-KH');
  const [modalVisible, setModalVisible] = useState(false);

  // Load saved language once on mount.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && KEI_LANGUAGES.some((item) => item.id === saved)) {
          setSelectedId(saved);
          onChange?.(saved);
        }
      } catch (e) {
        console.warn('LanguageSelector load failed', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep selector synchronized if the parent controls `value`.
  useEffect(() => {
    if (value && value !== selectedId) setSelectedId(value);
  }, [value, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setModalVisible(false);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, id).catch((e) =>
      console.warn('LanguageSelector save failed', e)
    );
    onChange?.(id);
  };

  const current: KEILanguage =
    KEI_LANGUAGES.find((item) => item.id === selectedId) || KEI_LANGUAGES[0];

  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="ជ្រើសរើសភាសា"
      >
        <Text style={styles.triggerText}>
          🌐 {current.nativeName} — {current.country}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={KEI_LANGUAGES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.row, item.id === selectedId && styles.rowActive]}
                  onPress={() => handleSelect(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.nativeName} — ${item.country}`}
                >
                  <Text style={styles.rowText}>
                    {item.nativeName} — {item.language} ({item.country})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  triggerText: { color: colors.textOnPrimary, fontSize: fontSize.md, fontWeight: 'bold' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, maxHeight: '60%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: 10 },
  row: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.sm },
  rowActive: { backgroundColor: colors.surfaceAlt },
  rowText: { color: colors.text, fontSize: fontSize.md },
});
