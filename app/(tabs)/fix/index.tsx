import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { ISSUE_DOORS, CaseIssueType } from '../../../src/features/cases/types';

export default function FixHomeScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const [description, setDescription] = useState('');

  const handleStartCase = () => {
    router.push({
      pathname: '/fix/new-case',
      params: { initialDesc: description },
    });
  };

  const handleSelectDoor = (doorId: CaseIssueType) => {
    router.push({
      pathname: '/fix/new-case',
      params: { issueType: doorId },
    });
  };

  return (
    <Screen scrollable>
      {/* What happened? input box */}
      <Card style={styles.promptCard}>
        <Text size="subtitle" color="ink" style={styles.cardHeader}>
          What happened?
        </Text>
        <Text size="body" color="muted" style={styles.cardSubtitle}>
          Tell us about the issue in simple words. We will help you write the official complaint.
        </Text>

        <Field
          label="Describe your problem"
          placeholder="For example: 2,000 rupees cut from bank via UPI but shopkeeper did not receive it"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          inputStyle={styles.multilineInput}
        />

        {/* The single primary action on this screen */}
        <Button
          label="Start a case"
          onPress={handleStartCase}
          icon={<Ionicons name="arrow-forward" size={20} color={colors.onAction} />}
        />
      </Card>

      {/* 4 Issue Doors */}
      <View style={styles.sectionHeaderRow}>
        <Text size="subtitle" color="ink">
          Common problems
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View my cases"
          onPress={() => router.push('/fix/my-cases')}
          style={styles.quietLink}
        >
          <Text size="body" color="primary" style={styles.linkText}>
            My cases
          </Text>
        </Pressable>
      </View>

      <View style={styles.doorsList}>
        {ISSUE_DOORS.map((door) => (
          <Card
            key={door.id}
            onPress={() => handleSelectDoor(door.id)}
            style={styles.doorCard}
            accessibilityLabel={door.title}
          >
            <View style={styles.doorRow}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <Ionicons name={door.iconName} size={24} color={colors.primary} />
              </View>

              <View style={styles.doorTextContainer}>
                <Text size="subtitle" color="ink">
                  {door.title}
                </Text>
                <Text size="body" color="muted">
                  {door.description}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  promptCard: {
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 6,
  },
  cardSubtitle: {
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quietLink: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  linkText: {
    fontWeight: '600',
  },
  doorsList: {
    gap: 12,
    marginBottom: 24,
  },
  doorCard: {
    paddingVertical: 14,
  },
  doorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  doorTextContainer: {
    flex: 1,
    marginRight: 8,
  },
});
