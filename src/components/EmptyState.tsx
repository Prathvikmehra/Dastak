import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceAlt,
          },
        ]}
      >
        <Ionicons name={iconName} size={40} color={colors.primary} />
      </View>

      <Text size="subtitle" color="ink" align="center" style={styles.title}>
        {title}
      </Text>

      <Text size="body" color="muted" align="center" style={styles.description}>
        {description}
      </Text>

      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 20,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
  },
});
