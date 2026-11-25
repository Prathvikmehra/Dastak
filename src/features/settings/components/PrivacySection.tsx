import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';
import { useCases } from '../../cases/store';
import { useMoney } from '../../money/store';
import { useMedicines } from '../../medicine/store';
import { deleteAllUserData } from '../delete-all';

export const PrivacySection: React.FC = () => {
  const { colors } = useTheme();
  const copy = useCopy();
  const { clearCases } = useCases();
  const { clearMoney } = useMoney();
  const { clearMedicines } = useMedicines();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = () => {
    Alert.alert(copy.settings.deleteAllConfirmTitle, copy.settings.deleteAllConfirmMessage, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.settings.deleteAllConfirmButton,
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await clearCases();
            await clearMoney();
            await clearMedicines();
            const result = await deleteAllUserData();
            if (result.ok) {
              Alert.alert(copy.common.done, copy.settings.deleteAllSuccessMessage);
            } else {
              Alert.alert(copy.common.ok, copy.settings.deleteAllFailedMessage);
            }
          } catch {
            Alert.alert(copy.common.ok, copy.settings.deleteAllFailedMessage);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
        <Text size="subtitle" color="ink" style={styles.title}>
          {copy.settings.privacyTitle}
        </Text>
      </View>
      <Text size="body" color="ink" style={styles.description}>
        {copy.settings.privacySubtitle}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text size="subtitle" color="danger" style={styles.dangerTitle}>
        {copy.settings.deleteAllTitle}
      </Text>
      <Text size="body" color="muted" style={styles.dangerSubtitle}>
        {copy.settings.deleteAllSubtitle}
      </Text>

      <Button
        label={copy.settings.deleteAllConfirmButton}
        variant="quiet"
        onPress={handleDeleteAll}
        loading={isDeleting}
        accessibilityRole="button"
        accessibilityLabel={copy.settings.deleteAllTitle}
        style={styles.deleteButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  dangerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerSubtitle: {
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteButton: {
    marginTop: 4,
  },
});
