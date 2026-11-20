import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Card, Text, Field, Button, DateField } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Medicine } from '../types';
import { useMedicines } from '../store';
import { useCopy } from '../../../copy/context';
import { LocalDate } from '../../../lib/dates';

export interface MedicineFormProps {
  personId: string;
  medicineId?: string;
  initialMedicine?: Medicine | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  personId,
  medicineId,
  initialMedicine,
  onSuccess,
  onCancel,
}) => {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const copy = useCopy();
  const { medicines, addMedicine, updateMedicine } = useMedicines();

  const existing =
    initialMedicine !== undefined
      ? initialMedicine
      : medicineId
        ? medicines.find((m) => m.id === medicineId) || null
        : null;

  const [name, setName] = useState(existing?.name || '');
  const [brandPrice, setBrandPrice] = useState(existing?.brandPricePerStrip || '');
  const [genericPrice, setGenericPrice] = useState(existing?.genericPricePerStrip || '');
  const [strips, setStrips] = useState(String(existing?.stripsPerMonth || '1'));
  const [lastRefill, setLastRefill] = useState<LocalDate | ''>(existing?.lastRefillDate || '');
  const [refillDays, setRefillDays] = useState(String(existing?.refillEveryDays ?? 30));
  const [note, setNote] = useState(existing?.note || '');

  const [nameError, setNameError] = useState<string | null>(null);
  const [brandPriceError, setBrandPriceError] = useState<string | null>(null);
  const [hasDateError, setHasDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const brandPriceInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const hasSaved = useRef(false);

  const [initial] = useState(() => ({
    name: existing?.name || '',
    brandPrice: existing?.brandPricePerStrip || '',
    genericPrice: existing?.genericPricePerStrip || '',
    strips: String(existing?.stripsPerMonth || '1'),
    lastRefill: existing?.lastRefillDate || '',
    refillDays: String(existing?.refillEveryDays ?? 30),
    note: existing?.note || '',
  }));

  const isDirty =
    name !== initial.name ||
    brandPrice !== initial.brandPrice ||
    genericPrice !== initial.genericPrice ||
    strips !== initial.strips ||
    lastRefill !== initial.lastRefill ||
    refillDays !== initial.refillDays ||
    note !== initial.note;

  useEffect(() => {
    if (!navigation?.addListener) return;
    return (navigation as any).addListener('beforeRemove', (e: any) => {
      if (!isDirty || isSubmitting || hasSaved.current) return;
      e.preventDefault();
      Alert.alert(copy.unsavedChanges.title, copy.unsavedChanges.message, [
        { text: copy.unsavedChanges.keepEditing, style: 'cancel' },
        {
          text: copy.unsavedChanges.leave,
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
  }, [navigation, isDirty, isSubmitting, copy]);

  const handleSubmit = async () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError(copy.medicineForm.errors.nameRequired);
      nameInputRef.current?.focus();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      hasError = true;
    }
    if (!brandPrice.trim()) {
      setBrandPriceError(copy.medicineForm.errors.priceRequired);
      if (!hasError) {
        brandPriceInputRef.current?.focus();
        scrollRef.current?.scrollTo({ y: 80, animated: true });
      }
      hasError = true;
    }
    if (hasDateError) {
      if (!hasError) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
      hasError = true;
    }
    if (hasError) return;

    setNameError(null);
    setBrandPriceError(null);
    setIsSubmitting(true);

    const payload = {
      personId,
      name: name.trim(),
      brandPricePerStrip: brandPrice.trim(),
      genericPricePerStrip: genericPrice.trim() || undefined,
      stripsPerMonth: Math.max(1, Number(strips) || 1),
      lastRefillDate: lastRefill.trim() ? (lastRefill as LocalDate) : undefined,
      refillEveryDays: Math.max(1, Number(refillDays) || 30),
      note: note.trim() || undefined,
    };

    try {
      if (existing) await updateMedicine(existing.id, payload);
      else await addMedicine(payload);
      hasSaved.current = true;
      if (onSuccess) onSuccess();
      else router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const m = copy.medicineForm;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Card
            style={[
              styles.safety,
              { backgroundColor: colors.surfaceAlt, borderRadius: radius.card },
            ]}
          >
            <Text size="caption" color="ink" style={{ lineHeight: 18 }}>
              {m.safetyNotice}
            </Text>
          </Card>
          <Field
            ref={nameInputRef}
            label={m.nameLabel}
            placeholder={m.namePlaceholder}
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (nameError) setNameError(null);
            }}
            error={nameError || undefined}
          />
          <Field
            ref={brandPriceInputRef}
            label={m.brandPriceLabel}
            placeholder={m.brandPricePlaceholder}
            value={brandPrice}
            onChangeText={(t) => {
              setBrandPrice(t);
              if (brandPriceError) setBrandPriceError(null);
            }}
            keyboardType="numeric"
            error={brandPriceError || undefined}
          />
          <Field
            label={m.genericPriceLabel}
            placeholder={m.genericPricePlaceholder}
            value={genericPrice}
            onChangeText={setGenericPrice}
            keyboardType="numeric"
            helper={m.genericHelper}
          />
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Field
                label={m.stripsLabel}
                placeholder={m.stripsPlaceholder}
                value={strips}
                onChangeText={setStrips}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfCol}>
              <Field
                label={m.refillDaysLabel}
                placeholder={m.refillDaysPlaceholder}
                value={refillDays}
                onChangeText={setRefillDays}
                keyboardType="numeric"
              />
            </View>
          </View>
          <DateField
            label={m.lastRefillLabel}
            value={lastRefill}
            onChange={setLastRefill}
            onError={setHasDateError}
            helper={m.lastRefillHelper}
            legacyValue={existing?.legacyLastRefillDate}
          />
          <Field
            label={m.noteLabel}
            placeholder={m.notePlaceholder}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            inputStyle={styles.noteInput}
          />
        </ScrollView>
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Button
            label={existing ? m.saveButtonEdit : m.saveButtonAdd}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.actionBtn}
          />
          <Button
            label={m.cancelButton}
            variant="quiet"
            onPress={onCancel || (() => router.back())}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28 },
  safety: { marginBottom: 16, padding: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  actionBar: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  actionBtn: { marginBottom: 8 },
});
