import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    message: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
});
