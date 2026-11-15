import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { IssueType } from '../../../src/features/cases/types';
import { useCases } from '../../../src/features/cases/store';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';
import { copy } from '../../../src/copy/en';

interface IssueOption {
  id: IssueType;
  label: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const ISSUE_OPTIONS: IssueOption[] = [
  {
    id: 'refund',
    label: copy.fixHome.doors.refund.title,
    subtitle: copy.fixHome.doors.refund.subtitle,
    iconName: 'cart-outline',
  },
  {
    id: 'fraud',
    label: copy.fixHome.doors.fraud.title,
    subtitle: copy.fixHome.doors.fraud.subtitle,
    iconName: 'alert-circle-outline',
  },
  {
    id: 'bank',
    label: copy.fixHome.doors.bank.title,
    subtitle: copy.fixHome.doors.bank.subtitle,
    iconName: 'business-outline',
  },
  {
    id: 'insurance',
    label: copy.fixHome.doors.insurance.title,
    subtitle: copy.fixHome.doors.insurance.subtitle,
    iconName: 'shield-outline',
  },
];

export default function NewCaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    issueType?: string;
    initialDesc?: string;
    note?: string;
  }>();
  const { colors, radius } = useTheme();
  const { createCase } = useCases();

  // Prefill issueType if valid
  const initialIssue =
    params.issueType && ['refund', 'fraud', 'bank', 'insurance'].includes(params.issueType)
      ? (params.issueType as IssueType)
      : null;

  const [issueType, setIssueType] = useState<IssueType | null>(initialIssue);
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [note, setNote] = useState(params.note || params.initialDesc || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseAmount(amount);

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

      {/* Selectable 4 Issue Cards */}
      <View style={styles.section}>
        <Text size="subtitle" color="ink" style={styles.sectionTitle}>
          {copy.newCase.issueTypeLabel}
        </Text>

        <View style={styles.issuesGrid}>
          {ISSUE_OPTIONS.map((option) => {
            const isSelected = issueType === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  setIssueType(option.id);
                  if (error) {
                    setError(null);
                  }
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${option.label}: ${option.subtitle}`}
                style={[
                  styles.issueCard,
                  {
                    backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <View style={styles.issueCardRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected ? colors.surface : colors.surfaceAlt,
                        borderRadius: radius.button,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.iconName}
                      size={22}
                      color={isSelected ? colors.primary : colors.muted}
                    />
                  </View>
                  <View style={styles.issueTextContainer}>
                    <Text size="subtitle" color="ink">
                      {option.label}
                    </Text>
                    <Text size="caption" color="muted" numberOfLines={2}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.muted,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={14} color={colors.surface} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text size="caption" color="danger" style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Form Fields */}
      <Card style={styles.formCard}>
        <Field
          label={copy.newCase.companyLabel}
          placeholder={copy.newCase.companyPlaceholder}
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
          label={copy.newCase.referenceLabel}
          placeholder={copy.newCase.referencePlaceholder}
          value={reference}
          onChangeText={setReference}
          helper="Helps the company locate your transaction"
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

        {/* The single primary action on this screen */}
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  issuesGrid: {
    gap: 10,
  },
  issueCard: {
    minHeight: 64,
    padding: 14,
    borderWidth: 2,
    justifyContent: 'center',
  },
  issueCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  issueTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontWeight: '600',
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
