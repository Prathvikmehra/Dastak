import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './Text';
import { Button } from './Button';
import { logger } from '../lib/logger';
import { en } from '../copy/en';
import { useLanguage } from '../copy/context';
import { useTheme } from '../theme/ThemeContext';
import { lightColors, darkColors, ColorTokens } from '../theme/colors';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorFallback: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  // ErrorBoundary may sit outside ThemeProvider. We check system color scheme
  // via useColorScheme() to select darkColors or lightColors from the static palette.
  const systemScheme = useColorScheme();
  const staticPalette: ColorTokens = systemScheme === 'dark' ? darkColors : lightColors;
  let colors: ColorTokens = staticPalette;
  try {
    const theme = useTheme();
    if (theme?.colors) {
      colors = theme.colors;
    }
  } catch {
    // When ErrorBoundary wraps ThemeProvider, useTheme throws; use static palette
  }

  let copy = en;
  try {
    const lang = useLanguage();
    if (lang?.copy) {
      copy = lang.copy;
    }
  } catch {
    // fallback copy
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text size="subtitle" color="ink" style={styles.message}>
          {copy.errorBoundary.message}
        </Text>
        <Button
          label={copy.errorBoundary.tryAgain}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel={copy.errorBoundary.tryAgain}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Unhandled UI exception in ErrorBoundary', { error, errorInfo });
  }

  resetError = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.resetError} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  button: {
    minWidth: 160,
  },
});
