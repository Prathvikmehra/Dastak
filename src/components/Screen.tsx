import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollRef?: React.Ref<React.ElementRef<typeof ScrollView>>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  scrollRef,
}) => {
  const { colors, isDark, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  return (
    <SafeAreaView style={[containerStyle, style]} edges={['bottom', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            ref={scrollRef}
            style={styles.fill}
            contentContainerStyle={[
              {
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: insets.bottom + spacing.xxl,
              },
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.fill,
              {
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: insets.bottom + spacing.md,
              },
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
