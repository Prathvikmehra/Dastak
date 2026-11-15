import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TextSize } from '../theme/typography';
import { ColorTokens } from '../theme/colors';

export interface TextProps extends RNTextProps {
  size?: TextSize;
  color?: keyof ColorTokens | string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  size = 'body',
  color = 'ink',
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { colors, typography } = useTheme();

  const resolvedColor =
    typeof color === 'string' && color in colors
      ? colors[color as keyof ColorTokens]
      : (color as string);

  const typo = typography[size];

  const combinedStyle: TextStyle = {
    fontSize: typo.fontSize,
    lineHeight: typo.lineHeight,
    fontWeight: typo.fontWeight,
    color: resolvedColor,
    textAlign: align,
  };

  return (
    <RNText style={[combinedStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};
