import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Card, Text, Field, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Relationship } from '../types';
import { copy } from '../../../copy/en';

export interface AddPersonModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, relationship?: Relationship) => Promise<void>;
}

const RELATIONSHIPS: Relationship[] = ['Parent', 'Spouse', 'Someone who has passed away', 'Other'];

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ visible, onClose, onAdd }) => {
  const { colors, radius, minTouchTarget } = useTheme();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('Parent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const m = copy.addPersonModal;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(name.trim(), relationship);
      setName('');
      setRelationship('Parent');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card style={styles.modalCard}>
          <Text size="subtitle" color="ink" style={styles.title}>
            {m.title}
          </Text>
          <Text size="body" color="muted" style={styles.subtitle}>
            {m.subtitle}
          </Text>

          <Field
            label={m.nameLabel}
            placeholder={m.namePlaceholder}
            value={name}
            onChangeText={setName}
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

          <Button
            label={m.saveButton}
            onPress={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            style={styles.saveButton}
          />
          <Button label={m.cancelButton} variant="quiet" onPress={onClose} />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
  },
  title: {
    marginBottom: 4,
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
  saveButton: {
    marginBottom: 8,
  },
});
