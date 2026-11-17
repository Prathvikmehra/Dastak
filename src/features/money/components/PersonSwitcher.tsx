import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components';
import { useTheme } from '../../../theme/ThemeContext';
import { Person } from '../types';
import { copy } from '../../../copy/en';

export interface PersonSwitcherProps {
  people: Person[];
  activePersonId: string;
  onSelectPerson: (id: string) => void;
  onAddPersonPress: () => void;
}

export const PersonSwitcher: React.FC<PersonSwitcherProps> = ({
  people,
  activePersonId,
  onSelectPerson,
  onAddPersonPress,
}) => {
  const { colors, radius, minTouchTarget } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {people.map((p) => {
          const isSelected = p.id === activePersonId;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`View radar for ${p.name}`}
              onPress={() => onSelectPerson(p.id)}
              style={[
                styles.chip,
                {
                  minHeight: minTouchTarget,
                  borderRadius: radius.button,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                size="body"
                color={isSelected ? 'surface' : 'ink'}
                style={{ fontWeight: isSelected ? '600' : '400' }}
              >
                {p.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.moneyRadar.personSwitcherAdd}
          onPress={onAddPersonPress}
          style={[
            styles.chip,
            styles.addChip,
            {
              minHeight: minTouchTarget,
              borderRadius: radius.button,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text size="body" color="primary" style={{ fontWeight: '600' }}>
            {copy.moneyRadar.personSwitcherAdd}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChip: {
    flexDirection: 'row',
    gap: 6,
    borderStyle: 'dashed',
  },
});
