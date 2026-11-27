import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button } from '../src/components';
import { useCases } from '../src/features/cases/store';
import { useCopy } from '../src/copy/context';
import { RemindersSection } from '../src/features/settings/components/RemindersSection';
import { LanguageSection } from '../src/features/settings/components/LanguageSection';
import { ThemeSection } from '../src/features/settings/components/ThemeSection';
import { SourcesSection } from '../src/features/settings/components/SourcesSection';
import { PrivacySection } from '../src/features/settings/components/PrivacySection';
import { CorruptDataBanner } from '../src/features/settings/components/CorruptDataBanner';

export default function SettingsAndHelpScreen() {
  const router = useRouter();
  const copy = useCopy();
  const { hadCorruptedData } = useCases();

  return (
    <Screen scrollable>
      <CorruptDataBanner show={hadCorruptedData} />
      <RemindersSection />
      <LanguageSection />
      <ThemeSection />
      <SourcesSection />
      <PrivacySection />

      <View style={styles.closeContainer}>
        <Button label={copy.settings.backToApp} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeContainer: {
    marginBottom: 32,
  },
});
