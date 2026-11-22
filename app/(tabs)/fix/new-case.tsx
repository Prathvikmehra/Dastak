import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, Card, Field, Button, DateField } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { IssueType } from '../../../src/features/cases/types';
import { useCases } from '../../../src/features/cases/store';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { LocalDate } from '../../../src/lib/dates';
import { useCopy } from '../../../src/copy/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_ASKED_KEY } from '../../notification-prompt';
import {
  IssueSelector,
  FraudTimingSelector,
  FraudWhenOption,
} from '../../../src/features/cases/components/IssueSelector';

export default function NewCaseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const copy = useCopy();
  const params = useLocalSearchParams<{
    issueType?: string;
    initialDesc?: string;
    note?: string;
    fraudWhen?: string;
    routed?: string;
  }>();
  const { createCase } = useCases();

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const selectorY = useRef(0);

  const initialIssue =
    params.issueType && ['refund', 'fraud', 'bank', 'insurance'].includes(params.issueType)
      ? (params.issueType as IssueType)
      : null;

  const [issueType, setIssueType] = useState<IssueType | null>(initialIssue);
  const [fraudWhen, setFraudWhen] = useState<FraudWhenOption>(
    params.fraudWhen === 'hour' ? 'hour' : 'today'
  );
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [incidentDate, setIncidentDate] = useState<LocalDate | ''>('');
  const [note, setNote] = useState(params.note || params.initialDesc || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseAmount(amount);

  const activeLabels = issueType
    ? copy.newCase.fieldLabels[issueType]
    : {
        company: copy.newCase.companyLabel,
        companyPlaceholder: copy.newCase.companyPlaceholder,
        reference: copy.newCase.referenceLabel,
        referencePlaceholder: copy.newCase.referencePlaceholder,
      };

  const handleSave = async () => {
    if (!issueType) {
      setError(copy.newCase.issueRequired);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createCase({
        issueType,
        company,
        amount: parsedAmount !== null ? String(parsedAmount) : amount,
        reference,
        incidentDate,
        note,
        fraudWhen: issueType === 'fraud' ? fraudWhen : undefined,
      });

      const asked = await AsyncStorage.getItem(NOTIFICATION_ASKED_KEY);
      if (!asked) {
        router.replace({
          pathname: '/notification-prompt' as any,
          params: { id: created.id },
        });
      } else {
        router.replace({
          pathname: '/fix/case-detail',
          params: { id: created.id },
        });
      }
    } catch {
      setError(copy.newCase.issueRequired);
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable scrollRef={scrollRef}>
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          {copy.newCase.title}
        </Text>
        <Text size="body" color="muted">
          {copy.newCase.subtitle}
        </Text>
      </View>

      {params.routed === 'true' && issueType ? (
        <Card
          style={[
            styles.routedStrip,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.routedStripRow}>
            <Text size="body" color="ink" style={styles.routedText}>
              {copy.newCase.routedGuess(copy.fixHome.doors[issueType].title)}{' '}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.newCase.changeChoice}
              onPress={() => scrollRef.current?.scrollTo({ y: selectorY.current, animated: true })}
              style={styles.changeBtn}
            >
              <Text size="body" color="primary" style={styles.changeLinkText}>
                {copy.newCase.changeChoice}
              </Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      {params.routed === 'false' ? (
        <Card
          style={[
            styles.routedStrip,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Text size="body" color="muted">
            {copy.newCase.noGuessPickBest}
          </Text>
        </Card>
      ) : null}

      <View
        onLayout={(e) => {
          selectorY.current = e.nativeEvent.layout.y;
        }}
      >
        <IssueSelector
          selected={issueType}
          onSelect={(t) => {
            setIssueType(t);
            if (error) setError(null);
          }}
          error={error}
        />
      </View>

      {issueType === 'fraud' ? (
        <FraudTimingSelector selected={fraudWhen} onSelect={setFraudWhen} />
      ) : null}

      <Card style={styles.formCard}>
        <Field
          label={activeLabels.company}
          placeholder={activeLabels.companyPlaceholder}
          value={company}
          onChangeText={setCompany}
        />

        <Field
          label={copy.newCase.amountLabel}
          placeholder={copy.newCase.amountPlaceholder}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          helper={
            parsedAmount !== null
              ? copy.newCase.amountPreview(formatRupees(parsedAmount))
              : copy.newCase.amountHelper
          }
        />

        <Field
          label={activeLabels.reference}
          placeholder={activeLabels.referencePlaceholder}
          value={reference}
          onChangeText={setReference}
          helper={copy.newCase.referenceHelper}
        />

        <DateField
          label={copy.newCase.incidentDateLabel}
          value={incidentDate}
          onChange={setIncidentDate}
        />

        <Field
          label={copy.newCase.noteLabel}
          placeholder={copy.newCase.notePlaceholder}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          inputStyle={styles.multilineInput}
        />

        <Button
          label={isSubmitting ? copy.newCase.savingButton : copy.newCase.saveButton}
          onPress={handleSave}
          disabled={isSubmitting}
          style={styles.saveButton}
        />

        <Button
          label={copy.common.cancel}
          variant="quiet"
          onPress={() => router.back()}
          disabled={isSubmitting}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  title: { marginBottom: 6 },
  routedStrip: { marginBottom: 16, padding: 12, borderWidth: 1 },
  routedStripRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  routedText: { lineHeight: 22 },
  changeBtn: { minHeight: 48, minWidth: 48, justifyContent: 'center' },
  changeLinkText: { fontWeight: '700', textDecorationLine: 'underline' },
  formCard: { marginBottom: 24 },
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
  saveButton: { marginTop: 8, marginBottom: 10 },
});
