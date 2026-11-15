import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, Card, Field, Button } from '../../../src/components';
import { ISSUE_DOORS } from '../../../src/features/cases/types';

export default function NewCaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ issueType?: string; initialDesc?: string }>();

  const selectedDoor = ISSUE_DOORS.find((d) => d.id === params.issueType);

  const [issueTitle, setIssueTitle] = useState(selectedDoor ? selectedDoor.title : '');
  const [details, setDetails] = useState(params.initialDesc || '');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');

  const handleSubmit = () => {
    // Navigate to case detail with mock ID
    router.replace({
      pathname: '/fix/case-detail',
      params: {
        id: 'CAS-1042',
        title: issueTitle || 'Payment dispute',
        amount: amount || '2500',
        status: 'in_progress',
      },
    });
  };

  return (
    <Screen scrollable>
      <View style={styles.introContainer}>
        <Text size="title" color="ink" style={styles.heading}>
          Create a case
        </Text>
        <Text size="body" color="muted">
          Fill in these details so we can draft your complaint letter and guide your next steps.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Field
          label="What type of issue is this?"
          placeholder="For example: UPI payment dispute"
          value={issueTitle}
          onChangeText={setIssueTitle}
          helper="A short sentence naming your problem"
        />

        <Field
          label="Amount in dispute (in rupees)"
          placeholder="For example: 2500"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          helper="Leave blank if no money was lost"
        />

        <Field
          label="Your name"
          placeholder="As shown in your bank passbook or app"
          value={contactName}
          onChangeText={setContactName}
        />

        <Field
          label="Tell us what happened"
          placeholder="Describe date, time, and what message you saw on your phone"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          inputStyle={styles.multilineInput}
        />

        {/* The single primary action on this screen */}
        <Button label="Save and review case" onPress={handleSubmit} style={styles.primaryButton} />

        <Button label="Cancel and go back" variant="quiet" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    marginBottom: 16,
  },
  heading: {
    marginBottom: 6,
  },
  formCard: {
    marginBottom: 24,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 8,
    marginBottom: 12,
  },
});
