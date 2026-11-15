import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, accessibilityLabel }) => {
  const { colors, radius, minTouchTarget, spacing } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: onPress ? minTouchTarget : undefined,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.85 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
