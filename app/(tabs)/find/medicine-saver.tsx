import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, EmptyState } from '../../../src/components';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useMoney } from '../../../src/features/money/store';
import { useMedicines } from '../../../src/features/medicine/store';
import { Medicine } from '../../../src/features/medicine/types';
import { PersonSwitcher } from '../../../src/features/money/components/PersonSwitcher';
import { AddPersonModal } from '../../../src/features/money/components/AddPersonModal';
import { MedicineCard } from '../../../src/features/medicine/components/MedicineCard';
import { AddMedicineModal } from '../../../src/features/medicine/components/AddMedicineModal';
import { formatRupees } from '../../../src/lib/formatters';
import { openWeb } from '../../../src/lib/links';
import { copy } from '../../../src/copy/en';

export default function MedicineSaverScreen() {
  const { colors, radius } = useTheme();
  const { people, activePersonId, setActivePersonId, activePerson, addPerson } = useMoney();

  const { personMedicines, personTotals, addMedicine, updateMedicine, deleteMedicine } =
    useMedicines();

  const [addPersonModalVisible, setAddPersonModalVisible] = useState(false);
  const [addMedModalVisible, setAddMedModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  const list = personMedicines(activePersonId);
  const totals = personTotals(activePersonId);

  const handleOpenJanAushadhi = async () => {
    await openWeb('https://janaushadhi.gov.in');
  };

  const handleSaveMed = async (input: Omit<Medicine, 'id'>) => {
    if (editingMed) {
      await updateMedicine(editingMed.id, input);
      setEditingMed(null);
    } else {
      await addMedicine(input);
    }
  };

  return (
    <Screen scrollable>
      {/* Person switcher row */}
      <PersonSwitcher
        people={people}
        activePersonId={activePersonId}
        onSelectPerson={setActivePersonId}
        onAddPersonPress={() => setAddPersonModalVisible(true)}
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
          Check prices and find government Jan Aushadhi Kendras:
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
          Monthly spend for {activePerson.name}
        </Text>
        <Text size="body" color="primary" style={styles.spendText}>
          Spending {formatRupees(totals.monthlySpend)} a month
        </Text>

        {totals.monthlySaving !== null && totals.monthlySaving > 0 && (
          <View style={styles.savingBox}>
            <Text size="body" color="success" style={{ fontWeight: '600' }}>
              You could save {formatRupees(totals.monthlySaving)} a month
            </Text>
            {totals.yearlySaving !== null && (
              <Text size="caption" color="muted">
                Difference across the year: {formatRupees(totals.yearlySaving)}
              </Text>
            )}
          </View>
        )}
      </Card>

      {/* List of medicines or empty state */}
      {list.length === 0 ? (
        <EmptyState
          iconName="medkit-outline"
          title="No medicines added yet"
          description={`Add medicines taken by ${activePerson.name} to track monthly spending and check savings.`}
        />
      ) : (
        <View style={styles.medsList}>
          {list.map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onEdit={(med) => {
                setEditingMed(med);
                setAddMedModalVisible(true);
              }}
              onDelete={deleteMedicine}
            />
          ))}
        </View>
      )}

      {/* Primary Action Button */}
      <View style={styles.footer}>
        <Button
          label="Add a medicine"
          onPress={() => {
            setEditingMed(null);
            setAddMedModalVisible(true);
          }}
        />
      </View>

      <AddPersonModal
        visible={addPersonModalVisible}
        onClose={() => setAddPersonModalVisible(false)}
        onAdd={async (name, rel) => {
          await addPerson(name, rel);
        }}
      />

      <AddMedicineModal
        visible={addMedModalVisible}
        personId={activePersonId}
        initialMedicine={editingMed}
        onClose={() => {
          setAddMedModalVisible(false);
          setEditingMed(null);
        }}
        onSave={handleSaveMed}
      />
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
