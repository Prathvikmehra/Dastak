import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Field } from '../../../components';
import { useCopy } from '../../../copy/context';

export interface MedicineFormRefillFieldsProps {
  genericPrice: string;
  onChangeGenericPrice: (val: string) => void;
  strips: string;
  onChangeStrips: (val: string) => void;
  refillDays: string;
  onChangeRefillDays: (val: string) => void;
}

export const MedicineFormRefillFields: React.FC<MedicineFormRefillFieldsProps> = ({
  genericPrice,
  onChangeGenericPrice,
  strips,
  onChangeStrips,
  refillDays,
  onChangeRefillDays,
}) => {
  const copy = useCopy();
  const m = copy.medicineForm;

  return (
    <>
      <Field
        label={m.genericPriceLabel}
        placeholder={m.genericPricePlaceholder}
        value={genericPrice}
        onChangeText={onChangeGenericPrice}
        keyboardType="numeric"
        helper={m.genericHelper}
      />
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Field
            label={m.stripsLabel}
            placeholder={m.stripsPlaceholder}
            value={strips}
            onChangeText={onChangeStrips}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfCol}>
          <Field
            label={m.refillDaysLabel}
            placeholder={m.refillDaysPlaceholder}
            value={refillDays}
            onChangeText={onChangeRefillDays}
            keyboardType="numeric"
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },
});
