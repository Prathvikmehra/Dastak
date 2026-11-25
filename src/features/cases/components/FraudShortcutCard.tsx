import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';
import { openPhone } from '../../../lib/links';

export interface FraudShortcutCardProps {
  onSaveDetails: () => void;
}

export const FraudShortcutCard: React.FC<FraudShortcutCardProps> = ({ onSaveDetails }) => {
  const { colors } = useTheme();
  const copy = useCopy();

  return (
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
      <Button label={copy.fixHome.fraudShortcut.saveLink} variant="quiet" onPress={onSaveDetails} />
    </Card>
  );
};

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
});
