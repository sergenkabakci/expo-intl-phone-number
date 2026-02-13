import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { InternationalPhoneInput } from '../src/components/InternationalPhoneInput';

// Mocks
const mockOnChange = jest.fn();

describe('InternationalPhoneInput', () => {
    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders correctly with default props', () => {
        const { getByPlaceholderText, getByText } = render(
            <InternationalPhoneInput value="" onChange={mockOnChange} defaultCountry="US" />
        );

        expect(getByPlaceholderText('Phone Number')).toBeTruthy();
        expect(getByText('+1')).toBeTruthy(); // US Code
    });

    it('formats input as typed (US)', () => {
        const { getByPlaceholderText } = render(
            <InternationalPhoneInput value="" onChange={mockOnChange} defaultCountry="US" />
        );

        const input = getByPlaceholderText('Phone Number');

        fireEvent.changeText(input, '2025550123');

        // libphonenumber-js formatting logic check
        // Expect internal state (controlled component logic requires re-render with new value usually, 
        // but here we check emitted value)

        // The component emits E.164 + Country Code
        // First emission might be partial
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
        expect(lastCall[0]).toBe('+12025550123'); // E.164
        expect(lastCall[1]).toBe('US'); // ISO2
    });

    it('allows selecting a country from dropdown', async () => {
        const { getByText, getByPlaceholderText, queryByText } = render(
            <InternationalPhoneInput value="" onChange={mockOnChange} defaultCountry="US" />
        );

        // Open dropdown
        fireEvent.press(getByText('+1'));

        // Check if list appears (via Search input usually)
        const searchInput = getByPlaceholderText('Search...');
        expect(searchInput).toBeTruthy();

        // Select Turkey
        // Mock data says TR is calling code 90
        // We need to find the item. FlashList mock renders all items.
        const turkeyItem = getByText('Turkey');
        expect(turkeyItem).toBeTruthy();

        fireEvent.press(turkeyItem);

        // Dropdown should close
        expect(queryByText('Search...')).toBeNull();

        // Calling code should update
        expect(getByText('+90')).toBeTruthy();
    });

    it('filters countries via allowedCountries prop', () => {
        const { getByText, queryByText, getByPlaceholderText } = render(
            <InternationalPhoneInput
                value=""
                onChange={mockOnChange}
                defaultCountry="US"
                allowedCountries={['US', 'CA']}
            />
        );

        fireEvent.press(getByText('+1'));

        expect(getByText('Canada')).toBeTruthy();
        expect(queryByText('Turkey')).toBeNull();
    });

    it('validates strictly excluded characters', () => {
        const { getByPlaceholderText } = render(
            <InternationalPhoneInput value="" onChange={mockOnChange} defaultCountry="US" />
        );

        const input = getByPlaceholderText('Phone Number');

        fireEvent.changeText(input, 'abc');

        // Should NOT call onChange for invalid chars
        expect(mockOnChange).not.toHaveBeenCalled();
    });
});
