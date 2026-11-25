import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text, Button } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { useCopy } from '../../../copy/context';
import { IssueType } from '../types';
import { openPhone } from '../../../lib/links';

export interface RoutedStripProps {
  routed?: string;
  issueType: IssueType | null;
  candidates: IssueType[];
  onChangeChoice: () => void;
}

export const RoutedStrip: React.FC<RoutedStripProps> = ({
  routed,
  issueType,
  candidates,
  onChangeChoice,
}) => {
  const { colors } = useTheme();
  const copy = useCopy();

  if (candidates.length === 2) {
    const doorA = copy.fixHome.doors[candidates[0]].title;
    const doorB = copy.fixHome.doors[candidates[1]].title;
    return (
      <Card
        style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        <Text size="body" color="ink" style={styles.titleText}>
          {copy.newCase.twoCandidatesStrip(doorA, doorB)}
        </Text>
        <Text size="caption" color="muted" style={styles.adviceText}>
          {copy.newCase.call1930Advice}
        </Text>
        <Button
          label={copy.fixHome.fraudShortcut.callButton}
          onPress={() => openPhone('1930', (msg) => Alert.alert(copy.common.call, msg))}
          icon={<Ionicons name="call" size={16} color={colors.onAction} />}
          style={styles.callBtn}
        />
      </Card>
    );
  }

  if (routed === 'true' && issueType) {
    return (
      <Card
        style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        <View style={styles.row}>
          <Text size="body" color="ink" style={styles.inlineText}>
            {copy.newCase.routedGuess(copy.fixHome.doors[issueType].title)}{' '}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.newCase.changeChoice}
            onPress={onChangeChoice}
            style={styles.changeBtn}
          >
            <Text size="body" color="primary" style={styles.changeLinkText}>
              {copy.newCase.changeChoice}
            </Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  if (routed === 'false') {
    return (
      <Card
        style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        <Text size="body" color="muted">
          {copy.newCase.noGuessPickBest}
        </Text>
      </Card>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  card: { marginBottom: 16, padding: 12, borderWidth: 1 },
  titleText: { lineHeight: 22, marginBottom: 4 },
  adviceText: { lineHeight: 18, marginBottom: 10 },
  callBtn: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  inlineText: { lineHeight: 22 },
  changeBtn: { minHeight: 48, minWidth: 48, justifyContent: 'center' },
  changeLinkText: { fontWeight: '700', textDecorationLine: 'underline' },
});
