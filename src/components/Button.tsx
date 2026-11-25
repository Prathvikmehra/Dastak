import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'quiet';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  ...rest
}) => {
  const { colors, radius, minTouchTarget } = useTheme();

  const isPrimary = variant === 'primary';

  const containerStyle: ViewStyle = {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    borderRadius: radius.button,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isPrimary ? colors.action : 'transparent',
    borderWidth: isPrimary ? 0 : 1,
    borderColor: isPrimary ? 'transparent' : colors.border,
    opacity: disabled ? 0.5 : 1,
  };

  const textColor = isPrimary ? colors.onAction : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel || label}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        containerStyle,
        pressed && !disabled && !loading && { opacity: 0.8 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            size="body"
            style={{
              color: textColor,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});
