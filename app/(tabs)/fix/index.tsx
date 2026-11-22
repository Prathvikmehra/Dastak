import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useCases } from '../../../src/features/cases/store';
import { IssueType } from '../../../src/features/cases/types';
import {
  currentStep,
  daysUntilNext,
  hasEscalatedPastFirstStep,
} from '../../../src/features/cases/engine';
import { formatRupees } from '../../../src/lib/formatters';
import { useCopy } from '../../../src/copy/context';
import { OpenCasesSummary } from '../../../src/features/cases/components/OpenCasesSummary';
import { buildRouteParams, FRAUD_SHORTCUT_PARAMS } from '../../../src/features/cases/router';
import { openPhone } from '../../../src/lib/links';

interface DoorItem {
  id: IssueType;
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export default function FixHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { openCases, totalRecovered } = useCases();
  const copy = useCopy();
  const [description, setDescription] = useState('');

  const doorConfig: { id: IssueType; iconName: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'refund', iconName: 'cart-outline' },
    { id: 'fraud', iconName: 'alert-circle-outline' },
    { id: 'bank', iconName: 'business-outline' },
    { id: 'insurance', iconName: 'shield-outline' },
  ];
  const doors: DoorItem[] = doorConfig.map((d) => ({
    id: d.id,
    title: copy.fixHome.doors[d.id].title,
    description: copy.fixHome.doors[d.id].subtitle,
    iconName: d.iconName,
  }));

  const now = new Date();

  let urgentNextText = '';
  if (openCases.length > 0) {
    let minDays = Infinity;
    for (const c of openCases) {
      const isOverdue = hasEscalatedPastFirstStep(c, now);
      const step = currentStep(c, now);
      const remaining = daysUntilNext(c, now);

      if (isOverdue) {
        urgentNextText = copy.fixHome.urgentActionNeeded(step.who);
        break;
      } else if (remaining !== null && remaining < minDays) {
        minDays = remaining;
        urgentNextText =
          remaining === 0
            ? copy.fixHome.urgentToday(step.who)
            : copy.fixHome.urgentNextInDays(step.who, remaining);
      } else if (!urgentNextText) {
        urgentNextText = copy.fixHome.urgentNext(step.who);
      }
    }
  }

  const handleStartCase = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      router.push({ pathname: '/fix/new-case' });
      return;
    }
    router.push({
      pathname: '/fix/new-case',
      params: buildRouteParams(description),
    });
  };

  const handleSelectDoor = (doorId: IssueType) => {
    router.push({
      pathname: '/fix/new-case',
      params: { issueType: doorId },
    });
  };

  return (
    <Screen scrollable>
      {/* Fraud shortcut: compact card at the very top of Fix home */}
      <Card
        style={[
          styles.fraudShortcutCard,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <View style={styles.fraudShortcutHeader}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text size="body" color="ink" style={styles.fraudShortcutText}>
            {copy.fixHome.fraudShortcut.prompt}
          </Text>
        </View>
        <Button
          label={copy.fixHome.fraudShortcut.callButton}
          onPress={() => openPhone('1930', (msg) => Alert.alert(copy.common.call, msg))}
          icon={<Ionicons name="call" size={18} color={colors.onAction} />}
          style={styles.fraudCallBtn}
        />
        <Button
          label={copy.fixHome.fraudShortcut.saveLink}
          variant="quiet"
          onPress={() =>
            router.push({
              pathname: '/fix/new-case',
              params: FRAUD_SHORTCUT_PARAMS,
            })
          }
        />
      </Card>

      {totalRecovered > 0 ? (
        <View
          style={[
            styles.recoveredBanner,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.success,
              borderRadius: radius.card,
            },
          ]}
        >
          <Ionicons name="sparkles" size={20} color={colors.success} />
          <Text size="subtitle" color="success" style={styles.recoveredText}>
            {copy.fixHome.recoveredBanner(formatRupees(totalRecovered))}
          </Text>
        </View>
      ) : null}

      {openCases.length > 0 ? (
        <OpenCasesSummary
          count={openCases.length}
          urgentText={urgentNextText}
          onViewCases={() => router.push('/fix/my-cases')}
        />
      ) : null}

      <Card style={styles.promptCard}>
        <Text size="subtitle" color="ink" style={styles.cardHeader}>
          {copy.fixHome.title}
        </Text>
        <Text size="body" color="muted" style={styles.cardSubtitle}>
          {copy.fixHome.subtitle}
        </Text>

        <Field
          label={copy.fixHome.boxTitle}
          placeholder={copy.fixHome.boxPlaceholder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          inputStyle={styles.multilineInput}
        />

        <Button
          label={copy.fixHome.findDoorButton}
          onPress={handleStartCase}
          icon={<Ionicons name="arrow-forward" size={20} color={colors.onAction} />}
        />
      </Card>

      <View style={styles.sectionHeaderRow}>
        <Text size="subtitle" color="ink">
          {copy.fixHome.commonProblemsHeading}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.myCases.title}
          onPress={() => router.push('/fix/my-cases')}
          style={styles.quietLink}
        >
          <Text size="body" color="primary" style={styles.linkText}>
            {copy.myCases.title}
          </Text>
        </Pressable>
      </View>

      <View style={styles.doorsList}>
        {doors.map((door) => (
          <Card
            key={door.id}
            onPress={() => handleSelectDoor(door.id)}
            style={styles.doorCard}
            accessibilityLabel={door.title}
          >
            <View style={styles.doorRow}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <Ionicons name={door.iconName} size={24} color={colors.primary} />
              </View>

              <View style={styles.doorTextContainer}>
                <Text size="subtitle" color="ink">
                  {door.title}
                </Text>
                <Text size="body" color="muted">
                  {door.description}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fraudShortcutCard: { marginBottom: 16, padding: 14, borderWidth: 1 },
  fraudShortcutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  fraudShortcutText: { flex: 1, lineHeight: 20 },
  fraudCallBtn: { marginBottom: 6 },
  recoveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  recoveredText: { fontWeight: '700' },
  promptCard: { marginBottom: 24 },
  cardHeader: { marginBottom: 6 },
  cardSubtitle: { marginBottom: 16 },
  multilineInput: { minHeight: 64, textAlignVertical: 'top' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quietLink: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  linkText: { fontWeight: '600' },
  doorsList: { gap: 12, marginBottom: 24 },
  doorCard: { paddingVertical: 14 },
  doorRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  doorTextContainer: { flex: 1, marginRight: 8 },
});
