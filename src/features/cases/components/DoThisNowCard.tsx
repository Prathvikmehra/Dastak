import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Case, LadderStep } from '../types';
import { buildCallScript } from '../engine';
import { useCopy } from '../../../copy/context';

export interface DoThisNowCardProps {
  caseItem: Case;
  step: LadderStep;
  isUrgentBannerActive: boolean;
  onCall: (phone: string) => void;
  onOpenWebsite: (url: string) => void;
  onShareDraft: () => void;
}

export const DoThisNowCard: React.FC<DoThisNowCardProps> = ({
  caseItem,
  step,
  isUrgentBannerActive,
  onCall,
  onOpenWebsite,
  onShareDraft,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();

  const hasPhone = Boolean(step.phone);
  const hasScript = Boolean(step.scriptId);
  const callScript = hasScript ? buildCallScript(caseItem, step, copy.callScript) : '';
  const isRbiStep = step.scriptId === 'rbi14448';

  return (
    <Card style={styles.card}>
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.button,
            },
          ]}
        >
          <Text size="caption" color="primary" style={styles.badgeText}>
            {copy.caseDetail.doThisNow.title}
          </Text>
        </View>
      </View>

      <Text size="subtitle" color="ink" style={styles.stepWho}>
        {step.who}
      </Text>

      <Text size="body" color="ink" style={styles.stepHow}>
        {step.how}
      </Text>

      {/* If step has script: show call script card */}
      {hasScript && callScript ? (
        <View
          style={[
            styles.scriptBox,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              borderRadius: radius.button,
            },
          ]}
        >
          <View style={styles.scriptHeaderRow}>
            <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
            <Text size="caption" color="primary" style={styles.scriptHeader}>
              {copy.caseDetail.callScript.title}
            </Text>
          </View>
          <Text size="body" color="ink" style={styles.scriptText}>
            {callScript}
          </Text>
        </View>
      ) : null}

      <View style={styles.actionsContainer}>
        {isRbiStep && step.link ? (
          <>
            <Button
              label={copy.caseDetail.doThisNow.openCmsRbiButton}
              variant={isUrgentBannerActive ? 'quiet' : 'primary'}
              onPress={() => onOpenWebsite(step.link!)}
              icon={
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={isUrgentBannerActive ? colors.primary : colors.onAction}
                />
              }
            />
            {step.phone ? (
              <Button
                label={copy.caseDetail.doThisNow.callButton(step.phone)}
                variant="quiet"
                onPress={() => onCall(step.phone!)}
                icon={<Ionicons name="call" size={18} color={colors.primary} />}
              />
            ) : null}
            <Button
              label={copy.caseDetail.doThisNow.shareDraftButton}
              variant="quiet"
              onPress={onShareDraft}
              icon={<Ionicons name="share-outline" size={18} color={colors.primary} />}
            />
          </>
        ) : hasPhone ? (
          <>
            <Button
              label={copy.caseDetail.doThisNow.callButton(step.phone!)}
              variant={isUrgentBannerActive ? 'quiet' : 'primary'}
              onPress={() => onCall(step.phone!)}
              icon={
                <Ionicons
                  name="call"
                  size={18}
                  color={isUrgentBannerActive ? colors.primary : colors.onAction}
                />
              }
            />
            <Button
              label={copy.caseDetail.doThisNow.shareDraftButton}
              variant="quiet"
              onPress={onShareDraft}
              icon={<Ionicons name="share-outline" size={18} color={colors.primary} />}
            />
            {step.link ? (
              <Button
                label={copy.caseDetail.doThisNow.websiteButton}
                variant="quiet"
                onPress={() => onOpenWebsite(step.link!)}
                icon={<Ionicons name="open-outline" size={18} color={colors.primary} />}
              />
            ) : null}
          </>
        ) : (
          <>
            <Button
              label={copy.caseDetail.doThisNow.shareDraftButton}
              variant={isUrgentBannerActive ? 'quiet' : 'primary'}
              onPress={onShareDraft}
              icon={
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={isUrgentBannerActive ? colors.primary : colors.onAction}
                />
              }
            />
            {step.link ? (
              <Button
                label={copy.caseDetail.doThisNow.websiteButton}
                variant="quiet"
                onPress={() => onOpenWebsite(step.link!)}
                icon={<Ionicons name="open-outline" size={18} color={colors.primary} />}
              />
            ) : null}
          </>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  badgeRow: {
    marginBottom: 8,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontWeight: '600',
  },
  stepWho: {
    marginBottom: 6,
    fontWeight: '700',
  },
  stepHow: {
    marginBottom: 14,
    lineHeight: 22,
  },
  scriptBox: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  scriptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scriptHeader: {
    fontWeight: '600',
  },
  scriptText: {
    lineHeight: 22,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 10,
  },
});
