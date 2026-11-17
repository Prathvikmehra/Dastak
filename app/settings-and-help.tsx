import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button } from '../src/components';
import { useCases } from '../src/features/cases/store';
import { RemindersSection } from '../src/features/settings/components/RemindersSection';
import { LanguageSection } from '../src/features/settings/components/LanguageSection';
import { ThemeSection } from '../src/features/settings/components/ThemeSection';
import { PrivacySection } from '../src/features/settings/components/PrivacySection';
import { CorruptDataBanner } from '../src/features/settings/components/CorruptDataBanner';

export default function SettingsAndHelpScreen() {
  const router = useRouter();
  const { hadCorruptedData } = useCases();

  return (
    <Screen scrollable>
      <CorruptDataBanner show={hadCorruptedData} />
      <RemindersSection />
      <LanguageSection />
      <ThemeSection />
      <PrivacySection />

      <View style={styles.closeContainer}>
        <Button label="Back to app" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeContainer: {
    marginBottom: 32,
  },
});
