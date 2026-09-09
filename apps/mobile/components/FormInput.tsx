import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    type KeyboardTypeOptions,
} from 'react-native';

interface FormInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    maxLength?: number;
    editable?: boolean;
}

export function FormInput({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    secureTextEntry,
    keyboardType,
    maxLength,
    editable = true,
}: FormInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    !!error && styles.inputError,
                    !editable && styles.inputDisabled,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                maxLength={maxLength}
                editable={editable}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FFF',
    },
    inputError: {
        borderColor: '#E53935',
    },
    inputDisabled: {
        backgroundColor: '#F5F5F5',
        color: '#999',
    },
    errorText: {
        fontSize: 12,
        color: '#E53935',
        marginTop: 4,
    },
});
