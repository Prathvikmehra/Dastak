import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Field, Button, EmptyState } from '../../../src/components';

export default function MoneyRadarScreen() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text size="title" color="ink" style={styles.title}>
          Money radar
        </Text>
        <Text size="body" color="muted">
          Search national records for deposits, matured policies, and pensions that were forgotten
          or left unclaimed.
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <Field
          label="Full name as in government ID"
          placeholder="For example: Ramesh Kumar"
          value={query}
          onChangeText={setQuery}
          helper="We do not store your name on any central server"
        />

        {/* Single primary action on screen */}
        <Button label="Check unclaimed records" onPress={handleSearch} />
      </Card>

      {!hasSearched ? (
        <EmptyState
          iconName="search-outline"
          title="Search unclaimed money"
          description="Enter a name above to check RBI UDGAM portal, post office savings, and life insurance registries in one place."
        />
      ) : (
        <EmptyState
          iconName="checkmark-circle-outline"
          title="No unclaimed money found"
          description={`We checked records for "${query || 'your search'}". No active unclaimed deposits were found under this name.`}
          actionLabel="Try another search"
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
