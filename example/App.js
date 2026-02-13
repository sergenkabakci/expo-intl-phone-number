import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { InternationalPhoneInput } from 'expo-intl-phone-number';

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('TR');
  const phoneInputRef = useRef(null);

  const handleChange = (value, iso2) => {
    setPhoneNumber(value);
    setCountryCode(iso2);
  };

  const checkValidity = () => {
    const isValid = phoneInputRef.current?.isValid();
    alert(`Phone valid: ${isValid}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Phone Input Test</Text>

      <View style={styles.inputContainer}>
        <InternationalPhoneInput
          ref={phoneInputRef}
          value={phoneNumber}
          onChange={handleChange}
          defaultCountry="TR"
          preferredCountries={['TR', 'US', 'GB', 'DE']}
          placeholder="Enter phone number"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Value: {phoneNumber}</Text>
        <Text style={styles.label}>Country: {countryCode}</Text>
      </View>

      <Button title="Check Validity" onPress={checkValidity} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  info: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
