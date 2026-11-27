import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';
import { getAllSources } from '../../cases/sources';
import { openLink } from '../../../lib/links';

export const SourcesSection: React.FC = () => {
  const { colors } = useTheme();
  const copy = useCopy();
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const sources = getAllSources(copy);

  const handleOpenSource = async (url: string) => {
    await openLink(url, (msg) => setFallbackNotice(msg));
  };

  return (
    <Card style={styles.card}>
      <Text size="subtitle" color="ink" accessibilityRole="header" style={styles.title}>
        {copy.settings.sourcesTitle}
      </Text>
      <Text size="body" color="muted" style={styles.explanation}>
        {copy.settings.sourcesExplanation}
      </Text>

      <View style={styles.list}>
        {sources.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              idx < sources.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemTextContainer}>
              <Text size="body" color="ink" style={styles.sourceName}>
                {item.name}
              </Text>
              <Text size="caption" color="muted" style={styles.sourceContact}>
                {item.contact}
              </Text>
              <Text size="caption" color="muted" style={styles.sourceStatus}>
                {item.statusLabel}
              </Text>
            </View>

            {item.isVerified && item.verifiedAgainst ? (
              <View style={styles.actionRow}>
                <Button
                  label={copy.settings.openSourceButton}
                  variant="quiet"
                  onPress={() => handleOpenSource(item.verifiedAgainst!)}
                  style={styles.openButton}
                />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {fallbackNotice ? (
        <Modal
          visible={Boolean(fallbackNotice)}
          transparent
          animationType="fade"
          onRequestClose={() => setFallbackNotice(null)}
        >
          <View style={styles.modalBackdrop}>
            <Card style={styles.modalCard}>
              <Text size="body" color="ink" style={styles.modalMessage}>
                {fallbackNotice}
              </Text>
              <Button
                label={copy.common.done}
                variant="primary"
                onPress={() => setFallbackNotice(null)}
              />
            </Card>
          </View>
        </Modal>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  explanation: {
    marginBottom: 16,
  },
  list: {
    marginTop: 4,
  },
  itemRow: {
    paddingVertical: 12,
  },
  itemTextContainer: {
    marginBottom: 6,
  },
  sourceName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceContact: {
    marginBottom: 4,
  },
  sourceStatus: {
    fontStyle: 'italic',
  },
  actionRow: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  openButton: {
    paddingHorizontal: 0,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
  },
  modalMessage: {
    marginBottom: 16,
  },
});
