import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { IssueType } from '../../../src/features/cases/types';
import { useCases } from '../../../src/features/cases/store';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';
import {
  IssueSelector,
  FraudTimingSelector,
  FraudWhenOption,
} from '../../../src/features/cases/components/IssueSelector';

export default function NewCaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    issueType?: string;
    initialDesc?: string;
    note?: string;
  }>();
  const { createCase } = useCases();

  const initialIssue =
    params.issueType && ['refund', 'fraud', 'bank', 'insurance'].includes(params.issueType)
      ? (params.issueType as IssueType)
      : null;

  const [issueType, setIssueType] = useState<IssueType | null>(initialIssue);
  const [fraudWhen, setFraudWhen] = useState<FraudWhenOption>('today');
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
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

      router.replace({
        pathname: '/fix/case-detail',
        params: { id: created.id },
      });
    } catch {
      setError('Could not save case. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          {copy.newCase.title}
        </Text>
        <Text size="body" color="muted">
          {copy.newCase.subtitle}
        </Text>
      </View>

      <IssueSelector
        selected={issueType}
        onSelect={(t) => {
          setIssueType(t);
          if (error) setError(null);
        }}
        error={error}
      />

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
              ? `Preview: ${formatRupees(parsedAmount)}`
              : 'Numbers only. Leave blank if no money was lost'
          }
        />

        <Field
          label={activeLabels.reference}
          placeholder={activeLabels.referencePlaceholder}
          value={reference}
          onChangeText={setReference}
          helper="Helps locate your transaction"
        />

        <Field
          label={copy.newCase.incidentDateLabel}
          placeholder={copy.newCase.incidentDatePlaceholder}
          value={incidentDate}
          onChangeText={setIncidentDate}
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
          label={isSubmitting ? 'Saving...' : copy.newCase.saveButton}
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
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 6,
  },
  formCard: {
    marginBottom: 24,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 10,
  },
});
