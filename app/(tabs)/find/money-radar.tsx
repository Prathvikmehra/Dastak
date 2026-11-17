import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Card } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { PLACES } from '../../../src/features/money/places';
import { STATUS_LABELS } from '../../../src/features/money/helpers';
import { PersonSwitcher } from '../../../src/features/money/components/PersonSwitcher';
import { AddPersonModal } from '../../../src/features/money/components/AddPersonModal';
import { formatRupees, parseAmount } from '../../../src/lib/formatters';

export default function MoneyRadarScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { people, activePersonId, setActivePersonId, activePerson, records, summary, addPerson } =
    useMoney();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Screen scrollable>
      {/* Person switcher row */}
      <PersonSwitcher
        people={people}
        activePersonId={activePersonId}
        onSelectPerson={setActivePersonId}
        onAddPersonPress={() => setModalVisible(true)}
      />

      {/* Deceased family member gentle guidance note */}
      {activePerson.relationship === 'Someone who has passed away' && (
        <Card
          style={[
            styles.deceasedCard,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.deceasedHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text size="body" color="ink" style={{ fontWeight: '600' }}>
              Claiming on behalf of {activePerson.name}
            </Text>
          </View>
          <Text size="body" color="muted" style={styles.deceasedText}>
            Claiming usually needs a death certificate and proof that you are the nominee or legal
            heir; check each place’s rules.
          </Text>
        </Card>
      )}

      {/* Radar Progress Summary */}
      <Card style={styles.summaryCard}>
        <Text size="subtitle" color="ink" style={styles.summaryTitle}>
          Progress for {activePerson.name}
        </Text>
        <Text size="body" color="muted">
          Checked {summary.checked} of {summary.total} places
        </Text>

        <View style={styles.amountsRow}>
          {summary.found > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.surfaceAlt, borderRadius: radius.button },
              ]}
            >
              <Text size="caption" color="primary" style={{ fontWeight: '600' }}>
                Found so far: {formatRupees(summary.found)}
              </Text>
            </View>
          )}

          {summary.received > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.surfaceAlt, borderRadius: radius.button },
              ]}
            >
              <Text size="caption" color="success" style={{ fontWeight: '600' }}>
                Received: {formatRupees(summary.received)}
              </Text>
            </View>
          )}
        </View>

        <Text size="caption" color="muted" style={styles.framingText}>
          UDGAM covers participating banks only; it does not cover post office savings, PF, or
          insurance. We do not promise any recovered money.
        </Text>
      </Card>

      {/* Six Places List */}
      <View style={styles.placesList}>
        {PLACES.map((place) => {
          const rec = records[place.id];
          const status = rec?.status || 'not_checked';
          const isDone = status === 'checked_nothing' || status === 'money_received';

          return (
            <Card
              key={place.id}
              onPress={() =>
                router.push({
                  pathname: '/find/place-detail',
                  params: { placeId: place.id, personId: activePersonId },
                })
              }
              style={styles.placeCard}
              accessibilityLabel={`Open guide for ${place.title}`}
            >
              <View style={styles.placeHeader}>
                <View style={styles.placeTitleBox}>
                  <Text size="subtitle" color="ink">
                    {place.title}
                  </Text>
                  <Text size="caption" color="primary">
                    {place.portalName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </View>

              <Text size="body" color="muted" style={styles.placeSubtitle}>
                {place.subtitle}
              </Text>

              <View style={styles.statusChipRow}>
                <View
                  style={[
                    styles.statusChip,
                    {
                      minHeight: 36,
                      borderRadius: radius.button,
                      backgroundColor: isDone ? colors.surfaceAlt : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    size="caption"
                    color={
                      status === 'money_received'
                        ? 'success'
                        : status === 'found_money'
                          ? 'primary'
                          : 'ink'
                    }
                    style={{ fontWeight: '600' }}
                  >
                    {STATUS_LABELS[status]}
                    {rec?.amount && parseAmount(rec.amount)
                      ? ` (${formatRupees(parseAmount(rec.amount) ?? 0)})`
                      : ''}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <AddPersonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={async (name, rel) => {
          await addPerson(name, rel);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  deceasedCard: {
    marginBottom: 16,
    padding: 14,
  },
  deceasedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  deceasedText: {
    lineHeight: 20,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 2,
  },
  amountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  framingText: {
    lineHeight: 18,
    marginTop: 2,
  },
  placesList: {
    gap: 12,
    marginBottom: 28,
  },
  placeCard: {
    paddingVertical: 14,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeTitleBox: {
    flex: 1,
    gap: 2,
  },
  placeSubtitle: {
    lineHeight: 20,
    marginBottom: 10,
  },
  statusChipRow: {
    flexDirection: 'row',
  },
  statusChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
});
