import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InternationalPhoneInput, InternationalPhoneInputRef } from '../src/index';

export default function App() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('TR');
    const phoneInputRef = useRef<InternationalPhoneInputRef>(null);

    const handleValidationCheck = () => {
        const isValid = phoneInputRef.current?.isValid();
        Alert.alert('Validation Check', isValid ? 'Valid Number ✅ ' + phoneNumber : 'Invalid Number ❌');
    };

    const handleGetCountry = () => {
        const country = phoneInputRef.current?.getCountry();
        Alert.alert('Current Country', JSON.stringify(country, null, 2));
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <StatusBar barStyle="dark-content" />
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Example</Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>Full Featured Input</Text>
                        <InternationalPhoneInput
                            ref={phoneInputRef}
                            value={phoneNumber}
                            onChange={(value, iso2) => {
                                setPhoneNumber(value);
                                setSelectedCountry(iso2);
                            }}
                            defaultCountry="TR"
                            placeholder="Enter phone..."
                            searchPlaceholder="Search country..."
                            initialCountry={selectedCountry}

                        />

                        <Text style={styles.hint}>
                            Current Value: <Text style={styles.mono}>{phoneNumber}</Text>
                        </Text>
                        <Text style={styles.hint}>
                            Selected Country: <Text style={styles.mono}>{selectedCountry}</Text>
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Control via Ref</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.button} onPress={() => phoneInputRef.current?.focus()}>
                            <Text style={styles.buttonText}>Focus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleValidationCheck}>
                            <Text style={styles.buttonText}>Check Valid</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleGetCountry}>
                            <Text style={styles.buttonText}>Get Country</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Programmatic Country Change</Text>


                    <View style={styles.card}>
                        <Text style={styles.label}>Custom Styled</Text>
                        <InternationalPhoneInput
                            value={phoneNumber}
                            onChange={(v) => setPhoneNumber(v)}
                            defaultCountry="US"
                            containerStyle={styles.customContainer}
                            inputStyle={styles.customInput}
                            flagContainerStyle={styles.customFlag}
                            callingCodeStyle={styles.customCallingCode}
                            placeholder="Custom styles..."
                            placeholderTextColor="#888"
                            pickerType="modal"
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginTop: 48,
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16,
        zIndex: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    hint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    mono: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
        color: '#111827',
        fontWeight: '500',
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    button: {
        backgroundColor: '#111827',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryButton: {
        backgroundColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    // Custom Styles
    customContainer: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
        borderRadius: 50,
        height: 60,
    },
    customInput: {
        color: '#0369A1',
        fontWeight: '600',
    },
    customCallingCode: {
        color: '#0EA5E9',
    },
    customFlag: {
        borderRadius: 100,
    }
});
