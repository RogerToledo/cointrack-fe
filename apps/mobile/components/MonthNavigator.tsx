import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface MonthNavigatorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

export function MonthNavigator({
  label,
  onPrevious,
  onNext,
  canGoNext,
}: MonthNavigatorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPrevious}
        style={styles.button}
        accessibilityLabel="Mês anterior"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      <Text style={styles.label} accessibilityRole="header">
        {label}
      </Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canGoNext}
        style={[styles.button, !canGoNext && styles.buttonDisabled]}
        accessibilityLabel="Próximo mês"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGoNext }}
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  button: {
    padding: 8,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    textAlign: 'center',
    flex: 1,
  },
});
