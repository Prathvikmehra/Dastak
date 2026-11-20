import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Field } from '../../../components';
import { Case } from '../types';
import { parseAmount } from '../../../lib/formatters';
import { useCopy } from '../../../copy/context';

export interface ResolveCardProps {
  caseItem: Case;
  onResolve: (recoveredAmount?: number) => Promise<void>;
}

export const ResolveCard: React.FC<ResolveCardProps> = ({ caseItem, onResolve }) => {
  const copy = useCopy();
  const [showModal, setShowModal] = useState(false);
  const [recoveredInput, setRecoveredInput] = useState(caseItem.amount || '');
  const [isResolving, setIsResolving] = useState(false);

  if (caseItem.resolvedAt) {
    return null;
  }

  const handleConfirm = async () => {
    setIsResolving(true);
    const parsed = parseAmount(recoveredInput);
    const defaultAmount = parseAmount(caseItem.amount);
    const finalAmount =
      parsed !== null ? parsed : defaultAmount !== null ? defaultAmount : undefined;

    await onResolve(finalAmount);
    setIsResolving(false);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {showModal ? (
        <Card style={styles.card}>
          <Text size="subtitle" color="ink" style={styles.title}>
            {copy.caseDetail.resolve.cardTitle}
          </Text>
          <Text size="body" color="muted" style={styles.subtitle}>
            {copy.caseDetail.resolve.cardSubtitle}
          </Text>

          <Field
            label={copy.caseDetail.resolve.amountLabel}
            placeholder={caseItem.amount || '0'}
            value={recoveredInput}
            onChangeText={setRecoveredInput}
            keyboardType="numeric"
            helper={copy.caseDetail.resolve.helper}
          />

          <Button
            label={
              isResolving
                ? copy.caseDetail.resolve.resolvingButton
                : copy.caseDetail.resolve.confirmButton
            }
            variant="primary"
            onPress={handleConfirm}
            disabled={isResolving}
            style={styles.confirmButton}
          />

          <Button
            label={copy.caseDetail.resolve.cancelButton}
            variant="quiet"
            onPress={() => setShowModal(false)}
            disabled={isResolving}
          />
        </Card>
      ) : (
        <Button
          label={copy.caseDetail.resolve.button}
          variant="quiet"
          onPress={() => {
            setRecoveredInput(caseItem.amount || '');
            setShowModal(true);
          }}
          style={styles.triggerButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  card: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 14,
  },
  confirmButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  triggerButton: {
    marginTop: 4,
  },
});
