import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Case } from '../types';
import { useCopy } from '../../../copy/context';

export interface UrgentBannerProps {
  caseItem: Case;
  onCall1930: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({ caseItem, onCall1930 }) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  const bodyText =
    caseItem.fraudWhen === 'earlier'
      ? copy.caseDetail.fraudUrgent.bannerBodyEarlier
      : copy.caseDetail.fraudUrgent.bannerBodyRecent;

  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Card
        style={[
          styles.fraudBanner,
          {
            backgroundColor: colors.dangerSurface,
            borderColor: colors.danger,
            borderRadius: radius.card,
          },
        ]}
      >
        <View style={styles.fraudBannerHeader}>
          <Ionicons name="warning" size={24} color={colors.danger} />
          <Text
            size="subtitle"
            color="danger"
            accessibilityRole="header"
            style={styles.fraudBannerTitle}
          >
            {copy.caseDetail.fraudUrgent.bannerTitle}
          </Text>
        </View>
        <Text size="body" color="ink" style={styles.fraudBannerBody}>
          {bodyText}
        </Text>
        <Button
          label={copy.caseDetail.fraudUrgent.callButton}
          onPress={onCall1930}
          icon={<Ionicons name="call" size={20} color={colors.onAction} />}
          style={styles.call1930Button}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  fraudBanner: {
    borderWidth: 2,
    marginBottom: 16,
  },
  fraudBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fraudBannerTitle: {
    fontWeight: '700',
  },
  fraudBannerBody: {
    marginBottom: 14,
    lineHeight: 22,
  },
  call1930Button: {
    width: '100%',
  },
});
