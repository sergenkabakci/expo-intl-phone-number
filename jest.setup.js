// Mock @shopify/flash-list
jest.mock('@shopify/flash-list', () => ({
    FlashList: ({ data, renderItem, keyExtractor }) => {
        const React = require('react');
        const { View } = require('react-native');
        return (
            <View testID="flash-list">
                {data.map((item, index) => (
                    <View key={keyExtractor ? keyExtractor(item, index) : index}>
                        {renderItem({ item, index })}
                    </View>
                ))}
            </View>
        );
    },
}));
