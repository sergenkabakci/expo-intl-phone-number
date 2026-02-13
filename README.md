# React Native International Phone Input

A fully customizable, strictly typed, and performant international phone input component for React Native (Expo compatible).

## Features

- 📱 **Strict TypeScript** support.
- 🏳️ **Local Flag Assets** (no external image deps).
- ⚡ **FlashList** powered for smooth scrolling.
- 🎨 **Fully Customizable** with StyleSheet props.
- 🧱 **Controlled Component** pattern.
- 🔍 **Searchable** country list.
- 🪄 **Ref API** for programmatic control (`setCountry`, `isValid`, `focus`).
- 🧹 **Automatic Formatting** via `libphonenumber-js`.

## Installation

```bash
npm install expo-intl-phone-number @shopify/flash-list libphonenumber-js
# OR
yarn add expo-intl-phone-number @shopify/flash-list libphonenumber-js
```

> Note: Ensure you have setup `expo` or `react-native` environment correctly.

## Usage

```tsx
import { InternationalPhoneInput } from 'expo-intl-phone-number';

// ...

<InternationalPhoneInput
  value={value}
  onChange={(newValue, iso2) => setValue(newValue)}
  defaultCountry="US"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | The current E.164 formatted value. |
| `onChange` | `(value, iso2) => void` | required | Callback when text changes. |
| `defaultCountry` | `CountryCode` | `'TR'` | Initial country selection. |
| `preferredCountries` | `CountryCode[]` | `[]` | List of countries to show at the top. |
| `excludedCountries` | `CountryCode[]` | `[]` | List of countries to remove. |
| `disabled` | `boolean` | `false` | Disable interactions. |
| `placeholder` | `string` | `'Phone Number'` | Input placeholder. |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder. |
| `pickerType` | `'dropdown' \| 'modal'` | `'dropdown'` | Country picker display type. |
| `modalHeight` | `number` | `300` | Height of the country picker. |

## Ref Methods

Use a ref to access imperative methods:

```tsx
const phoneRef = useRef<InternationalPhoneInputRef>(null);

// Focus the input
phoneRef.current?.focus();

// Check validity
const isValid = phoneRef.current?.isValid();

// Set country programmatically
phoneRef.current?.setCountry('GB');
```

## Customization

You can override almost any style:

- `containerStyle`
- `inputStyle`
- `flagContainerStyle`
- `dropdownStyle`
- `searchStyle`
- ...and more.

## Testing

This component includes a comprehensive test suite using Jest and React Native Testing Library.

```bash
npm test
```

Ensure your `jest.setup.js` is configured correctly (included in repo).

## Architecture

- **Rendering**: Uses `@shopify/flash-list` for the country dropdown to handle 200+ items efficiently.
- **Parsing**: `libphonenumber-js` handles all validation and formatting.
- **Styling**: Pure `StyleSheet` objects, no heavy CSS-in-JS libraries.

## Contributing

Pull requests are welcome.

## License

MIT
