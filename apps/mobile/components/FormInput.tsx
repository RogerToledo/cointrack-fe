import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type KeyboardTypeOptions,
} from 'react-native';
import { theme } from '../constants/theme';

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
        placeholderTextColor={theme.colors.placeholder}
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
    color: theme.colors.primaryDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  inputDisabled: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.mutedLight,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 4,
  },
});
