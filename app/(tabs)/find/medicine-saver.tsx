import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Field, Button, EmptyState } from '../../../src/components';

export default function MedicineSaverScreen() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          Medicine saver
        </Text>
        <Text size="body" color="muted">
          Look up the medicine name printed on your prescription or strip to find verified Jan
          Aushadhi and generic options.
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <Field
          label="Medicine brand name"
          placeholder="For example: Augmentin 625, Pan 40, Telma 40"
          value={query}
          onChangeText={setQuery}
          helper="Type the brand name written by the doctor"
        />

        {/* Single primary action on screen */}
        <Button label="Find generic alternatives" onPress={handleSearch} />
      </Card>

      {!hasSearched ? (
        <EmptyState
          iconName="medkit-outline"
          title="Search generic medicine"
          description="Generic medicines have the exact same active salt and strength as branded medicines, but cost significantly less."
        />
      ) : (
        <EmptyState
          iconName="information-circle-outline"
          title="Salt matched: Amoxicillin and Potassium Clavulanate"
          description={`Branded average: ₹210 for 10 tablets.\nGovernment Jan Aushadhi generic: ₹55 for 10 tablets.\nPotential saving: ₹155 per strip.`}
          actionLabel="Check another medicine"
          onAction={() => {
            setQuery('');
            setHasSearched(false);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 6,
  },
  searchCard: {
    marginBottom: 24,
  },
});
