import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export const HeaderHelpButton: React.FC = () => {
  const router = useRouter();
  const { colors, minTouchTarget } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Settings, language, and help"
      onPress={() => router.push('/help')}
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
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
