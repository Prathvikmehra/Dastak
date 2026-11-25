import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';
import { useCopy } from '../copy/context';

export interface StorageErrorBannerProps {
  show?: boolean;
  onDismiss?: () => void;
}

export const StorageErrorBanner: React.FC<StorageErrorBannerProps> = ({
  show = false,
  onDismiss,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  if (!show) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.danger,
          borderRadius: radius.card,
        },
      ]}
    >
      <Ionicons name="warning-outline" size={20} color={colors.danger} style={styles.icon} />
      <Text size="caption" color="ink" style={styles.text}>
        {copy.settings.storageErrorBanner}
      </Text>
      {onDismiss && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.common.done}
          onPress={onDismiss}
          style={styles.dismissButton}
        >
          <Ionicons name="close" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
  dismissButton: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
