import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Case } from '../types';
import { evidenceProgress } from '../engine';
import { useCopy } from '../../../copy/context';

export interface EvidenceChecklistProps {
  caseItem: Case;
  checklist: string[];
  onToggleItem: (item: string) => void;
}

export const EvidenceChecklist: React.FC<EvidenceChecklistProps> = ({
  caseItem,
  checklist,
  onToggleItem,
}) => {
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const progress = evidenceProgress(caseItem);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text size="subtitle" color="ink" accessibilityRole="header">
          {copy.caseDetail.evidence.title}
        </Text>
        <Text size="caption" color="primary" style={styles.progressText}>
          {copy.caseDetail.evidence.progress(progress.done, progress.total)}
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: progress.total, now: progress.done }}
        style={[styles.progressBarTrack, { backgroundColor: colors.border }]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: progress.done === progress.total ? colors.success : colors.primary,
              width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
            },
          ]}
        />
      </View>

      <Text size="caption" color="muted" style={styles.hint}>
        {copy.caseDetail.evidence.hint}
      </Text>

      <View style={styles.checklist}>
        {checklist.map((item) => {
          const isChecked = Boolean(caseItem.evidence && caseItem.evidence[item]);
          return (
            <Pressable
              key={item}
              onPress={() => onToggleItem(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              accessibilityLabel={item}
              style={[
                styles.checklistItem,
                {
                  borderColor: isChecked ? colors.success : colors.border,
                  backgroundColor: isChecked ? colors.surfaceAlt : colors.surface,
                  borderRadius: radius.button,
                },
              ]}
            >
              <Ionicons
                name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isChecked ? colors.success : colors.muted}
              />
              <Text
                size="body"
                color={isChecked ? 'ink' : 'muted'}
                style={[styles.checklistLabel, isChecked && styles.checklistLabelDone]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hint: {
    marginBottom: 12,
  },
  checklist: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 48,
    borderWidth: 1,
    gap: 12,
  },
  checklistLabel: {
    flex: 1,
  },
  checklistLabelDone: {
    textDecorationLine: 'line-through',
  },
});
