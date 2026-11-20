import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, EmptyState } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { useMedicines } from '../../../src/features/medicine/store';
import { PersonSwitcher } from '../../../src/features/money/components/PersonSwitcher';
import { MedicineCard } from '../../../src/features/medicine/components/MedicineCard';
import { formatRupees } from '../../../src/lib/formatters';
import { openWeb } from '../../../src/lib/links';
import { useCopy } from '../../../src/copy/context';

export default function MedicineSaverScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const copy = useCopy();
  const { people, activePersonId, setActivePersonId, activePerson } = useMoney();

  const { personMedicines, personTotals, deleteMedicine } = useMedicines();

  const list = personMedicines(activePersonId);
  const totals = personTotals(activePersonId);

  const handleOpenJanAushadhi = async () => {
    await openWeb('https://janaushadhi.gov.in');
  };

  return (
    <Screen scrollable>
      {/* Person switcher row */}
      <PersonSwitcher
        people={people}
        activePersonId={activePersonId}
        onSelectPerson={setActivePersonId}
        onAddPersonPress={() => router.push('/(tabs)/find/person-form')}
      />

      {/* Safety notice disclaimer */}
      <Card
        style={[
          styles.safetyBanner,
          { backgroundColor: colors.surfaceAlt, borderRadius: radius.card },
        ]}
      >
        <Text size="caption" color="ink" style={styles.safetyText}>
          {copy.medicineSaver.safetyNotice}
        </Text>
      </Card>

      {/* Official portal link */}
      <Card style={styles.linkCard}>
        <Text size="body" color="ink">
          {copy.medicineSaver.findKendras}
        </Text>
        <Button
          label={copy.medicineSaver.openJanAushadhi}
          variant="quiet"
          onPress={handleOpenJanAushadhi}
          style={styles.linkBtn}
        />
      </Card>

      {/* Monthly Spend & Potential Saving Totals */}
      <Card style={styles.totalsCard}>
        <Text size="subtitle" color="ink">
          {copy.medicineSaver.monthlySpendFor(activePerson.name)}
        </Text>
        <Text size="body" color="primary" style={styles.spendText}>
          {copy.medicineSaver.spendingMonthly(formatRupees(totals.monthlySpend))}
        </Text>

        {totals.monthlySaving !== null && totals.monthlySaving > 0 && (
          <View style={styles.savingBox}>
            <Text size="body" color="success" style={{ fontWeight: '600' }}>
              {copy.medicineSaver.couldSaveMonthly(formatRupees(totals.monthlySaving))}
            </Text>
            {totals.yearlySaving !== null && (
              <Text size="caption" color="muted">
                {copy.medicineSaver.yearlyDifference(formatRupees(totals.yearlySaving))}
              </Text>
            )}
          </View>
        )}
      </Card>

      {/* List of medicines or empty state */}
      {list.length === 0 ? (
        <EmptyState
          iconName="medkit-outline"
          title={copy.medicineSaver.emptyTitle}
          description={copy.medicineSaver.emptyMessage}
        />
      ) : (
        <View style={styles.medsList}>
          {list.map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onEdit={(med) => {
                router.push({
                  pathname: '/(tabs)/find/medicine-form',
                  params: { personId: activePersonId, medicineId: med.id },
                });
              }}
              onDelete={deleteMedicine}
            />
          ))}
        </View>
      )}

      {/* Primary Action Button */}
      <View style={styles.footer}>
        <Button
          label={copy.medicineSaver.addMedicine}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/find/medicine-form',
              params: { personId: activePersonId },
            });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safetyBanner: {
    marginBottom: 14,
    padding: 12,
  },
  safetyText: {
    lineHeight: 18,
  },
  linkCard: {
    marginBottom: 14,
    gap: 8,
  },
  linkBtn: {
    marginTop: 4,
  },
  totalsCard: {
    marginBottom: 16,
    gap: 4,
  },
  spendText: {
    fontWeight: '600',
    marginTop: 2,
  },
  savingBox: {
    marginTop: 6,
    gap: 2,
  },
  medsList: {
    marginBottom: 20,
  },
  footer: {
    marginBottom: 32,
  },
});
