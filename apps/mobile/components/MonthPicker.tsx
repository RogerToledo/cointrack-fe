import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONTH_NAMES_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface MonthPickerProps {
    currentMonth: string;
    onSelect: (month: string) => void;
    canGoNext?: boolean;
}

function parseMonth(monthStr: string): { year: number; month: number } {
    const [yearStr, monthStr2] = monthStr.split('-');
    return { year: parseInt(yearStr, 10), month: parseInt(monthStr2, 10) };
}

function formatMonth(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}

function generateMonths(): string[] {
    const months: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let year = currentYear; year >= currentYear - 2; year--) {
        const maxMonth = year === currentYear ? now.getMonth() + 1 : 12;
        for (let month = maxMonth; month >= 1; month--) {
            months.push(formatMonth(year, month));
        }
    }
    return months;
}

export function MonthPicker({ currentMonth, onSelect, canGoNext = true }: MonthPickerProps) {
    const [visible, setVisible] = useState(false);
    const { year, month } = parseMonth(currentMonth);
    const label = `${MONTH_NAMES_PT[month - 1]} ${year}`;
    const months = generateMonths();

    const handleSelect = (m: string) => {
        onSelect(m);
        setVisible(false);
    };

    return (
        <>
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
                <Text style={styles.triggerText}>{label}</Text>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Selecionar mês</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={months}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const m = parseMonth(item);
                                const isSelected = item === currentMonth;
                                return (
                                    <TouchableOpacity
                                        style={[styles.option, isSelected && styles.optionSelected]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {MONTH_NAMES_PT[m.month - 1]} {m.year}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark" size={20} color="#4F46E5" />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    triggerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    optionSelected: {
        backgroundColor: '#EEF2FF',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    optionTextSelected: {
        color: '#4F46E5',
        fontWeight: '600',
    },
});
