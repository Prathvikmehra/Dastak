import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Card, Text, Field, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useMoney } from '../store';
import { Relationship, Person } from '../types';
import { useCopy } from '../../../copy/context';

export interface PersonFormProps {
  onSuccess?: (person: Person) => void;
  onCancel?: () => void;
}

const RELATIONSHIPS: Relationship[] = ['Parent', 'Spouse', 'Someone who has passed away', 'Other'];

export const PersonForm: React.FC<PersonFormProps> = ({ onSuccess, onCancel }) => {
  const { colors, radius, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const copy = useCopy();
  const { addPerson } = useMoney();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('Parent');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const hasSaved = useRef(false);

  const isDirty = name.trim().length > 0;

  useEffect(() => {
    if (!navigation?.addListener) return;
    const unsubscribe = (navigation as any).addListener('beforeRemove', (e: any) => {
      if (!isDirty || isSubmitting || hasSaved.current) {
        return;
      }
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
    return unsubscribe;
  }, [navigation, isDirty, isSubmitting, copy]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(copy.personForm.errors.nameRequired);
      nameInputRef.current?.focus();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setNameError(null);
    setIsSubmitting(true);
    try {
      const created = await addPerson(name.trim(), relationship);
      hasSaved.current = true;
      if (onSuccess) {
        onSuccess(created);
      } else {
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const m = copy.personForm;

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
          <Text size="body" color="muted" style={styles.subtitle}>
            {m.subtitle}
          </Text>

          <Field
            ref={nameInputRef}
            label={m.nameLabel}
            placeholder={m.namePlaceholder}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (nameError) setNameError(null);
            }}
            error={nameError || undefined}
            helper={m.nameHelper}
          />

          <Text size="caption" color="muted" style={styles.relLabel}>
            {m.relLabel}
          </Text>
          <View style={styles.relRow}>
            {RELATIONSHIPS.map((rel) => {
              const isSelected = relationship === rel;
              return (
                <Pressable
                  key={rel}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={rel}
                  onPress={() => setRelationship(rel)}
                  style={[
                    styles.relChip,
                    {
                      minHeight: minTouchTarget,
                      borderRadius: radius.button,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.surfaceAlt : colors.surface,
                    },
                  ]}
                >
                  <Text
                    size="caption"
                    color={isSelected ? 'primary' : 'ink'}
                    style={{ fontWeight: isSelected ? '600' : '400' }}
                  >
                    {rel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {relationship === 'Someone who has passed away' && (
            <Card
              style={[
                styles.deceasedNote,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text size="caption" color="ink" style={{ lineHeight: 18 }}>
                {m.deceasedNotice}
              </Text>
            </Card>
          )}
        </ScrollView>

        <View
          style={[
            styles.stickyActionBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <Button
            label={m.saveButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.actionBtn}
          />
          <Button
            label={m.cancelButton}
            variant="quiet"
            onPress={handleCancel}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  subtitle: {
    marginBottom: 16,
  },
  relLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  relRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  relChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deceasedNote: {
    marginBottom: 16,
    padding: 12,
  },
  stickyActionBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionBtn: {
    marginBottom: 8,
  },
});
