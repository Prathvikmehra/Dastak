import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';

export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  helper?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Field = React.forwardRef<React.ElementRef<typeof TextInput>, FieldProps>(
  ({ label, helper, error, containerStyle, inputStyle, onLayout, ...inputProps }, ref) => {
    const { colors, radius, minTouchTarget } = useTheme();

    const borderColor = error ? colors.danger : colors.border;

    return (
      <View style={[styles.container, containerStyle]} onLayout={onLayout}>
        <Text size="subtitle" color="ink" style={styles.label}>
          {label}
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              minHeight: minTouchTarget,
              borderRadius: radius.field,
              borderColor,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                color: colors.ink,
                fontSize: 16, // Body text 16sp or larger
              },
              inputStyle,
            ]}
            {...inputProps}
          />
        </View>

        {error ? (
          <Text size="caption" color="danger" style={styles.hint}>
            {error}
          </Text>
        ) : helper ? (
          <Text size="caption" color="muted" style={styles.hint}>
            {helper}
          </Text>
        ) : null}
      </View>
    );
  }
);
Field.displayName = 'Field';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  input: {
    padding: 0,
    margin: 0,
  },
  hint: {
    marginTop: 6,
  },
});
