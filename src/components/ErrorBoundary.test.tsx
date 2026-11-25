import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';
import { LanguageProvider } from '../copy/context';
import { ThemeProvider } from '../theme/ThemeContext';
import { en } from '../copy/en';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useNavigation: () => ({
    addListener: jest.fn(() => () => {}),
    dispatch: jest.fn(),
  }),
}));

const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test crash');
  }
  return <Text>Child rendered normally</Text>;
};

const TestApp: React.FC = () => {
  const [hasError, setHasError] = useState(true);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary onReset={() => setHasError(false)}>
          <ProblemChild shouldThrow={hasError} />
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('ErrorBoundary component', () => {
  // Suppress expected console.error from React during crash simulation
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('catches render error, renders calm message and allows retry', async () => {
    await render(<TestApp />);

    // Shows calm message
    expect(screen.getByText(en.errorBoundary.message)).toBeTruthy();
    expect(screen.getByText(en.errorBoundary.tryAgain)).toBeTruthy();
    expect(screen.queryByText('Child rendered normally')).toBeNull();

    // Click try again
    await fireEvent.press(screen.getByText(en.errorBoundary.tryAgain));

    // After retry with shouldThrow=false, renders normally
    expect(screen.getByText('Child rendered normally')).toBeTruthy();
    expect(screen.queryByText(en.errorBoundary.message)).toBeNull();
  });
});
