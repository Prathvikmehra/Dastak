import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MedicineForm } from './MedicineForm';
import { MedicineCard } from './MedicineCard';
import { ThemeProvider } from '../../../theme/ThemeContext';
import { useMedicines } from '../store';
import { Medicine } from '../types';
import { today } from '../../../lib/dates';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useNavigation: () => ({
    addListener: jest.fn(() => () => {}),
    dispatch: jest.fn(),
  }),
}));

jest.mock('../store', () => {
  const actual = jest.requireActual('../store');
  return {
    ...actual,
    useMedicines: jest.fn(),
  };
});

const mockAddMedicine = jest.fn();
const mockUpdateMedicine = jest.fn();

const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 20 },
};

const renderWithTheme = async (ui: React.ReactElement) => {
  return await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );
};

describe('MedicineForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMedicines as jest.Mock).mockReturnValue({
      medicines: [],
      addMedicine: mockAddMedicine.mockResolvedValue({ id: 'm-new' }),
      updateMedicine: mockUpdateMedicine.mockResolvedValue({ id: 'm-edit' }),
    });
  });

  it('shows required name error and makes no store call when name is empty', async () => {
    await renderWithTheme(<MedicineForm personId="p1" />);

    const priceInput = screen.getByPlaceholderText('e.g. 120');
    await fireEvent.changeText(priceInput, '150');

    const saveBtn = screen.getByText('Save medicine');
    await fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Please enter a medicine name')).toBeTruthy();
    });
    expect(mockAddMedicine).not.toHaveBeenCalled();
  });

  it('shows invalid date error when 31/02 is entered and blocks submission', async () => {
    await renderWithTheme(<MedicineForm personId="p1" />);

    const nameInput = screen.getByPlaceholderText('e.g. Telmisartan 40mg');
    await fireEvent.changeText(nameInput, 'Paracetamol');

    const priceInput = screen.getByPlaceholderText('e.g. 120');
    await fireEvent.changeText(priceInput, '50');

    const pickDateBtn = screen.getByText('Pick a date');
    await fireEvent.press(pickDateBtn);

    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');

    await fireEvent.changeText(dayInput, '31');
    await fireEvent.changeText(monthInput, '02');
    await fireEvent.changeText(yearInput, '2026');

    await waitFor(() => {
      expect(screen.getByText('That date does not look right')).toBeTruthy();
    });

    const saveBtn = screen.getByText('Save medicine');
    await fireEvent.press(saveBtn);
    expect(mockAddMedicine).not.toHaveBeenCalled();
  });

  it('calls addMedicine with parsed values on valid input', async () => {
    await renderWithTheme(<MedicineForm personId="p1" />);

    const nameInput = screen.getByPlaceholderText('e.g. Telmisartan 40mg');
    await fireEvent.changeText(nameInput, 'Metformin 500mg');

    const brandPriceInput = screen.getByPlaceholderText('e.g. 120');
    await fireEvent.changeText(brandPriceInput, '120');

    const genericPriceInput = screen.getByPlaceholderText('e.g. 25');
    await fireEvent.changeText(genericPriceInput, '30');

    const stripsInput = screen.getByPlaceholderText('1');
    await fireEvent.changeText(stripsInput, '2');

    const todayChip = screen.getByText('Today');
    await fireEvent.press(todayChip);

    const saveBtn = screen.getByText('Save medicine');
    await fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAddMedicine).toHaveBeenCalledTimes(1);
      expect(mockAddMedicine).toHaveBeenCalledWith(
        expect.objectContaining({
          personId: 'p1',
          name: 'Metformin 500mg',
          brandPricePerStrip: '120',
          genericPricePerStrip: '30',
          stripsPerMonth: 2,
          lastRefillDate: today(),
          refillEveryDays: 30,
        })
      );
    });
  });

  it('pre-fills fields in edit mode and calls updateMedicine', async () => {
    const existingMed: Medicine = {
      id: 'm123',
      personId: 'p1',
      name: 'Atorvastatin 20mg',
      brandPricePerStrip: '240',
      genericPricePerStrip: '60',
      stripsPerMonth: 1,
      refillEveryDays: 30,
    };

    await renderWithTheme(
      <MedicineForm personId="p1" medicineId="m123" initialMedicine={existingMed} />
    );

    expect(screen.getByDisplayValue('Atorvastatin 20mg')).toBeTruthy();
    expect(screen.getByDisplayValue('240')).toBeTruthy();
    expect(screen.getByDisplayValue('60')).toBeTruthy();

    const nameInput = screen.getByDisplayValue('Atorvastatin 20mg');
    await fireEvent.changeText(nameInput, 'Atorvastatin 40mg');

    const saveBtn = screen.getByText('Save medicine');
    await fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMedicine).toHaveBeenCalledTimes(1);
      expect(mockUpdateMedicine).toHaveBeenCalledWith(
        'm123',
        expect.objectContaining({
          personId: 'p1',
          name: 'Atorvastatin 40mg',
          brandPricePerStrip: '240',
          genericPricePerStrip: '60',
        })
      );
    });
  });

  it('passes genericPrice as undefined when empty and card displays no saving', async () => {
    await renderWithTheme(<MedicineForm personId="p1" />);

    const nameInput = screen.getByPlaceholderText('e.g. Telmisartan 40mg');
    await fireEvent.changeText(nameInput, 'Aspirin 75mg');

    const brandPriceInput = screen.getByPlaceholderText('e.g. 120');
    await fireEvent.changeText(brandPriceInput, '45');

    const saveBtn = screen.getByText('Save medicine');
    await fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAddMedicine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Aspirin 75mg',
          genericPricePerStrip: undefined,
        })
      );
    });

    const medWithoutGeneric: Medicine = {
      id: 'm456',
      personId: 'p1',
      name: 'Aspirin 75mg',
      brandPricePerStrip: '45',
      stripsPerMonth: 1,
    };

    await renderWithTheme(
      <MedicineCard medicine={medWithoutGeneric} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.queryByText(/Save ₹/i)).toBeNull();
  });
});
