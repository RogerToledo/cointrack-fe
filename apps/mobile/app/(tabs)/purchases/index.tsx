import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatBRL } from '@cointrack/utils';

import { MonthNavigator } from '../../../components/MonthNavigator';
import { PullToRefreshList } from '../../../components/PullToRefreshList';
import { SwipeableRow } from '../../../components/SwipeableRow';
import { useMonthNavigation } from '../../../hooks/useMonthNavigation';
import { usePurchases } from '../../../hooks/usePurchases';

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function PurchasesScreen() {
    const { currentMonth, displayLabel, goToPrevious, goToNext, canGoNext } = useMonthNavigation();
    const { data, loading, error, refreshing, refresh, remove } = usePurchases(currentMonth);
    const router = useRouter();

    return (
        <View style={styles.container}>
            <MonthNavigator
                label={displayLabel}
                onPrevious={goToPrevious}
                onNext={goToNext}
                canGoNext={canGoNext}
            />
            <PullToRefreshList
                data={data}
                loading={loading}
                error={error}
                refreshing={refreshing}
                onRefresh={refresh}
                emptyMessage="Nenhuma compra encontrada para este período"
                keyExtractor={(item) => item.id}
                renderItem={(item) => (
                    <SwipeableRow onDelete={() => remove(item.id)}>
                        <TouchableOpacity
                            style={styles.itemContainer}
                            onPress={() => router.push(`/purchases/form?id=${item.id}`)}
                            accessibilityRole="button"
                            accessibilityLabel={`Editar compra ${item.description}`}
                        >
                            <View style={styles.itemContent}>
                                <View style={styles.itemLeft}>
                                    <Text style={styles.itemDescription} numberOfLines={1}>
                                        {item.description}
                                    </Text>
                                    <View style={styles.itemMeta}>
                                        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                                        {item.purchase_type ? (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{item.purchase_type}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                                <Text style={styles.itemAmount}>{formatBRL(item.amount)}</Text>
                            </View>
                        </TouchableOpacity>
                    </SwipeableRow>
                )}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/purchases/form')}
                accessibilityRole="button"
                accessibilityLabel="Adicionar compra"
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemLeft: {
        flex: 1,
        marginRight: 12,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemDate: {
        fontSize: 13,
        color: '#6b7280',
    },
    badge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
