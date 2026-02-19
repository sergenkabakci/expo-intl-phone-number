import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
    Keyboard,
    ViewStyle,
    TextStyle,
    ImageStyle,
    StyleProp,
    TouchableWithoutFeedback,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AsYouType, parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import { countryList, flags, Country } from '../data/countryList';

// --- Interfaces ---

export interface InternationalPhoneInputRef {
    focus: () => void;
    blur: () => void;
    setCountry: (iso2: CountryCode) => void;
    getCountry: () => Country;
    isValid: () => boolean;
}

export interface InternationalPhoneInputProps {
    value: string;
    onChange: (value: string, iso2: CountryCode) => void;
    defaultCountry?: CountryCode;
    disabled?: boolean;
    error?: string;

    // Data Configuration
    preferredCountries?: CountryCode[];
    allowedCountries?: CountryCode[];
    excludedCountries?: CountryCode[];

    // UI Logic
    placeholder?: string;
    placeholderTextColor?: string;
    searchPlaceholder?: string;
    pickerType?: 'dropdown' | 'modal';
    modalHeight?: number;
    modalBackground?: string;

    // Styling Overrides
    containerStyle?: StyleProp<ViewStyle>;
    modalContentStyle?: StyleProp<ViewStyle>;

    // Flag Section
    flagContainerStyle?: StyleProp<ViewStyle>;
    flagStyle?: StyleProp<ImageStyle>;
    callingCodeStyle?: StyleProp<TextStyle>;
    dividerStyle?: StyleProp<ViewStyle>;
    arrowStyle?: StyleProp<TextStyle>;

    // Input Section
    inputStyle?: StyleProp<TextStyle>;

    // Dropdown
    dropdownStyle?: StyleProp<ViewStyle>;
    dropdownItemStyle?: StyleProp<ViewStyle>;
    dropdownItemTextStyle?: StyleProp<TextStyle>;
    searchStyle?: StyleProp<ViewStyle>;
    searchInputStyle?: StyleProp<TextStyle>;
}

// --- Component ---

export const InternationalPhoneInput = React.memo(forwardRef<InternationalPhoneInputRef, InternationalPhoneInputProps>((props, ref) => {
    const {
        value,
        onChange,
        defaultCountry = 'TR',
        disabled,
        error,
        preferredCountries,
        allowedCountries,
        excludedCountries,
        placeholder = 'Phone Number',
        placeholderTextColor = '#9CA3AF',
        searchPlaceholder = 'Search...',
        pickerType = 'dropdown',
        modalHeight = 300,
        modalBackground = '#FFFFFF',
        containerStyle,
        modalContentStyle,
        flagContainerStyle,
        flagStyle,
        callingCodeStyle,
        dividerStyle,
        arrowStyle,
        inputStyle,
        dropdownStyle,
        dropdownItemStyle,
        dropdownItemTextStyle,
        searchStyle,
        searchInputStyle,
    } = props;

    // --- Calculations ---

    const finalCountryList = useMemo(() => {
        let list = [...countryList];

        // Filter allowed
        if (allowedCountries && allowedCountries.length > 0) {
            list = list.filter(c => allowedCountries.includes(c.iso2 as CountryCode));
        }

        // Filter excluded
        if (excludedCountries && excludedCountries.length > 0) {
            list = list.filter(c => !excludedCountries.includes(c.iso2 as CountryCode));
        }

        // Sort preferred to top
        if (preferredCountries && preferredCountries.length > 0) {
            const preferred = list.filter(c => preferredCountries.includes(c.iso2 as CountryCode));
            const others = list.filter(c => !preferredCountries.includes(c.iso2 as CountryCode));
            // Sort preferred by index in preferredCountries array to respect order
            preferred.sort((a, b) => preferredCountries.indexOf(a.iso2 as CountryCode) - preferredCountries.indexOf(b.iso2 as CountryCode));
            list = [...preferred, ...others];
        }

        return list;
    }, [allowedCountries, excludedCountries, preferredCountries]);

    // --- State ---

    const [isOpen, setIsOpen] = useState(false);
    const [internalNational, setInternalNational] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(
        finalCountryList.find(c => c.iso2 === defaultCountry) || finalCountryList[0] || countryList[0]
    );
    const [searchQuery, setSearchQuery] = useState('');

    const isInternalChange = useRef(false);
    const inputRef = useRef<TextInput>(null);

    // --- Logic ---

    // Expose Ref Methods
    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        setCountry: (iso2: CountryCode) => {
            const country = finalCountryList.find(c => c.iso2 === iso2);
            if (country) {
                handleSelectCountry(country);
            }
        },
        getCountry: () => selectedCountry,
        isValid: () => {
            const fullNumber = `+${selectedCountry.callingCode}${internalNational}`;
            try {
                const parsed = parsePhoneNumber(fullNumber, selectedCountry.iso2 as CountryCode);
                return parsed ? parsed.isValid() : false;
            } catch (e) {
                return false;
            }
        }
    }));

    // Sync prop value
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (!value) {
            setInternalNational('');
            return;
        }

        try {
            // Try parsing with selected country first to keep it if possible
            let parsed = parsePhoneNumber(value, selectedCountry.iso2 as CountryCode);

            // If invalid or mismatch, try parsing generically
            if (!parsed || !parsed.isValid()) {
                try {
                    parsed = parsePhoneNumber(value);
                } catch (e) { }
            }

            if (parsed && parsed.country) {
                if (parsed.country !== selectedCountry.iso2) {
                    const newCountry = finalCountryList.find(c => c.iso2 === parsed.country);
                    if (newCountry) {
                        setSelectedCountry(newCountry);
                    }
                }

                const asYouType = new AsYouType(parsed.country as CountryCode);
                asYouType.input(value);
                const formatted = asYouType.getNumber()?.format('NATIONAL') || value;
                setInternalNational(formatted);
            } else {
                setInternalNational(value);
            }
        } catch (e) {
            setInternalNational(value);
        }
    }, [value, finalCountryList]); // We depend on finalCountryList to validate availability

    const emitChange = useCallback((text: string, country: Country) => {
        isInternalChange.current = true;

        const cleanInput = text.replace(/[^0-9+]/g, '');

        const asYouType = new AsYouType(country.iso2 as CountryCode);
        asYouType.input(cleanInput);
        const number = asYouType.getNumber();

        if (number && number.isValid()) {
            onChange(number.format('E.164'), country.iso2 as CountryCode);
        } else {
            const nationalDigits = cleanInput.replace(/[^0-9]/g, '');
            onChange('+' + country.callingCode + nationalDigits, country.iso2 as CountryCode);
        }
    }, [onChange]);

    const handleTextChange = useCallback((text: string) => {
        if (!/^[0-9\s\-()]*$/.test(text)) return; // Strict char check

        const asYouType = new AsYouType(selectedCountry.iso2 as CountryCode);
        const formatted = asYouType.input(text);

        setInternalNational(formatted);
        emitChange(text, selectedCountry);
    }, [selectedCountry, emitChange]);

    // Ref to track current internalNational for country selection
    const internalNationalRef = useRef(internalNational);
    internalNationalRef.current = internalNational;

    const handleSelectCountry = useCallback((country: Country) => {
        const rawDigits = internalNationalRef.current.replace(/[^0-9]/g, '');
        const asYouType = new AsYouType(country.iso2 as CountryCode);
        const formatted = asYouType.input(rawDigits);

        // Update state
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchQuery('');
        setInternalNational(formatted);

        // Emit change after state updates (use setTimeout to avoid render-phase setState)
        setTimeout(() => {
            const emitAsYouType = new AsYouType(country.iso2 as CountryCode);
            emitAsYouType.input(rawDigits);
            const number = emitAsYouType.getNumber();

            if (number && number.isValid()) {
                onChange(number.format('E.164'), country.iso2 as CountryCode);
            } else {
                onChange('+' + country.callingCode + rawDigits, country.iso2 as CountryCode);
            }
        }, 0);
    }, [onChange]);

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return finalCountryList;
        const lower = searchQuery.toLowerCase();
        return finalCountryList.filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.callingCode.includes(lower) ||
            c.iso2.toLowerCase().includes(lower)
        );
    }, [searchQuery, finalCountryList]);

    // --- Handlers ---

    const toggleDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen(prev => !prev);
    }, [disabled]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Close dropdown when keyboard hides
    useEffect(() => {
        if (pickerType !== 'dropdown') return;

        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsOpen(false)
        );
        return () => hideSub.remove();
    }, [pickerType]);

    // --- Rendering ---

    const renderItem = useCallback(({ item }: { item: Country }) => (
        <Pressable
            style={[styles.item, dropdownItemStyle]}
            onPress={() => handleSelectCountry(item)}
        >
            <View style={styles.flagContainer}>
                <Image
                    source={flags[item.iso2]}
                    style={[styles.itemFlag, flagStyle]}
                    resizeMode="cover"
                />
            </View>
            <Text style={[styles.itemName, dropdownItemTextStyle]}>{item.name}</Text>
            <Text style={[styles.itemCode, dropdownItemTextStyle]}>+{item.callingCode}</Text>
        </Pressable>
    ), [handleSelectCountry, dropdownItemStyle, dropdownItemTextStyle, flagStyle]);

    // Calculate list height (modalHeight minus search input height ~50px)
    const listHeight = modalHeight - 50;

    return (
        <View style={[
            styles.container,
            containerStyle,
            error ? styles.borderError : null,
            disabled && styles.disabled
        ]}>

            {/* Flag Section */}
            <Pressable onPress={toggleDropdown} style={[styles.leftSection, flagContainerStyle]}>
                <View style={styles.selectedFlagContainer}>
                    <Image
                        source={flags[selectedCountry.iso2]}
                        style={[styles.selectedFlag, flagStyle]}
                        resizeMode="cover"
                    />
                </View>
                <Text style={[styles.callingCode, callingCodeStyle]}>+{selectedCountry.callingCode}</Text>
                <Text style={[styles.arrow, arrowStyle]}>{isOpen ? '▲' : '▼'}</Text>
            </Pressable>

            <View style={[styles.divider, dividerStyle]} />

            {/* Input Section */}
            <TextInput
                ref={inputRef}
                value={internalNational}
                onChangeText={handleTextChange}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType="phone-pad"
                style={[styles.input, inputStyle]}
                editable={!disabled}
            />

            {/* Dropdown Picker */}
            {isOpen && pickerType === 'dropdown' && (
                <>
                    <TouchableWithoutFeedback onPress={closeDropdown}>
                        <View style={styles.overlay} />
                    </TouchableWithoutFeedback>

                    <View style={[styles.dropdown, dropdownStyle, { backgroundColor: modalBackground }]}>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={placeholderTextColor}
                            style={[styles.searchInput, searchInputStyle, searchStyle]}
                        />
                        <View style={{ height: listHeight }}>
                            <FlashList
                                data={filteredCountries}
                                renderItem={renderItem}
                                estimatedItemSize={48}
                                keyExtractor={(item) => item.iso2}
                                keyboardShouldPersistTaps="always"
                                extraData={searchQuery}
                            />
                        </View>
                    </View>
                </>
            )}

            {/* Modal Picker */}

            <Modal
                visible={isOpen && pickerType === 'modal'}
                transparent
                animationType="slide"
                onRequestClose={closeDropdown}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeDropdown}
                >
                    <View style={{ flex: 1 }} />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalKeyboardView}
                >
                    <View
                        style={[
                            styles.modalContent,
                            modalContentStyle,
                            { height: modalHeight, backgroundColor: modalBackground }
                        ]}
                    >
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={placeholderTextColor}
                            style={[styles.searchInput, searchInputStyle, searchStyle]}
                            autoFocus
                        />

                        <FlashList
                            data={filteredCountries}
                            renderItem={renderItem}
                            estimatedItemSize={48}
                            keyExtractor={(item) => item.iso2}
                            keyboardShouldPersistTaps="always"
                            extraData={searchQuery}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}));

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        zIndex: 1,
        borderColor: '#D1D5DB',
    },
    borderError: {
        borderColor: '#EF4444',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#F9FAFB',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingLeft: 12,
        paddingRight: 8,
    },
    divider: {
        width: 1,
        height: '60%',
        backgroundColor: '#E5E7EB',
        marginRight: 8
    },
    selectedFlagContainer: {
        width: 24,
        height: 16,
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 6,
    },
    selectedFlag: {
        width: '100%',
        height: '100%',
    },
    callingCode: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginRight: 4,
    },
    arrow: {
        fontSize: 10,
        color: '#6B7280',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingRight: 12,
        fontSize: 16,
        color: '#111827',
    },
    overlay: {
        position: 'absolute',
        top: -9999,
        bottom: -9999,
        left: -9999,
        right: -9999,
        zIndex: 1,
    },
    dropdown: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 2,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalKeyboardView: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    searchInput: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#FAFAFA',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
    },
    flagContainer: {
        width: 24,
        height: 16,
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 12,
    },
    itemFlag: {
        width: '100%',
        height: '100%',
    },
    itemName: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    itemCode: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
});
