import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { copy } from '../copy/en';

export const HeaderActions: React.FC = () => {
  const router = useRouter();
  const { colors, minTouchTarget } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.header.helpAccessibility}
        onPress={() => router.push('/settings-and-help')}
        style={({ pressed }) => [
          styles.iconButton,
          {
            minWidth: minTouchTarget,
            minHeight: minTouchTarget,
          },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons name="settings-outline" size={22} color={colors.primary} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.header.helpAccessibility}
        onPress={() => router.push('/settings-and-help')}
        style={({ pressed }) => [
          styles.iconButton,
          {
            minWidth: minTouchTarget,
            minHeight: minTouchTarget,
          },
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export const HeaderHelpButton: React.FC = HeaderActions;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});
