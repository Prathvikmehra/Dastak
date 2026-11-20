import React from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { DateField } from './DateField';
import { ThemeProvider } from '../theme/ThemeContext';
import { LocalDate } from '../lib/dates';

const renderDateField = async (props: {
  label: string;
  value: LocalDate | '';
  onChange: (d: LocalDate) => void;
  maxDate?: LocalDate;
}) => {
  return await render(
    <ThemeProvider>
      <DateField {...props} />
    </ThemeProvider>
  );
};

describe('DateField Component', () => {
  it('renders chips and custom date inputs when Pick a date is pressed', async () => {
    const onChange = jest.fn();
    await renderDateField({
      label: 'Incident date',
      value: '',
      onChange,
    });

    expect(screen.getByText('Incident date')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();

    const pickBtn = screen.getByText('Pick a date');
    await fireEvent.press(pickBtn);

    expect(screen.getByText('DD')).toBeTruthy();
    expect(screen.getByText('MM')).toBeTruthy();
    expect(screen.getByText('YYYY')).toBeTruthy();
    expect(screen.getByPlaceholderText('DD')).toBeTruthy();
  });

  it('shows error on invalid date like 31/02/2026', async () => {
    const onChange = jest.fn();
    await renderDateField({
      label: 'Incident date',
      value: '',
      onChange,
      maxDate: '2030-12-31' as LocalDate,
    });

    const pickBtn = screen.getByText('Pick a date');
    await fireEvent.press(pickBtn);

    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');

    await fireEvent.changeText(dayInput, '31');
    await fireEvent.changeText(monthInput, '02');
    await fireEvent.changeText(yearInput, '2026');

    await waitFor(() => {
      expect(screen.getByText('That date does not look right')).toBeTruthy();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with parsed ISO date on valid input', async () => {
    const onChange = jest.fn();
    await renderDateField({
      label: 'Incident date',
      value: '',
      onChange,
      maxDate: '2030-12-31' as LocalDate,
    });

    const pickBtn = screen.getByText('Pick a date');
    await fireEvent.press(pickBtn);

    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');

    await fireEvent.changeText(dayInput, '15');
    await fireEvent.changeText(monthInput, '05');
    await fireEvent.changeText(yearInput, '2025');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2025-05-15');
    });
  });

  it('auto-advances focus from DD to MM and MM to YYYY', async () => {
    const focusSpy = jest.spyOn(TextInput.prototype, 'focus').mockImplementation(() => {});
    const onChange = jest.fn();
    await renderDateField({
      label: 'Incident date',
      value: '',
      onChange,
    });

    const pickBtn = screen.getByText('Pick a date');
    await fireEvent.press(pickBtn);

    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');

    focusSpy.mockClear();

    await fireEvent.changeText(dayInput, '12');
    expect(focusSpy).toHaveBeenCalledTimes(1);

    await fireEvent.changeText(monthInput, '11');
    expect(focusSpy).toHaveBeenCalledTimes(2);

    focusSpy.mockRestore();
  });
});
