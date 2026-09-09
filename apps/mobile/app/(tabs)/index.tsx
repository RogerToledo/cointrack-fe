import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { formatBRL } from '@cointrack/utils';

import { MonthNavigator } from '../../components/MonthNavigator';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorState } from '../../components/ErrorState';
import { useMonthNavigation } from '../../hooks/useMonthNavigation';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardScreen() {
    const { currentMonth, displayLabel, goToPrevious, goToNext, canGoNext } =
        useMonthNavigation();
    const { data, loading, error, refreshing, refresh } = useDashboard(currentMonth);

    return (
        <View style={styles.container}>
            <MonthNavigator
                label={displayLabel}
                onPrevious={goToPrevious}
                onNext={goToNext}
                canGoNext={canGoNext}
            />

            {loading && !refreshing ? (
                <LoadingScreen />
            ) : error ? (
                <ErrorState message={error} onRetry={refresh} />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                    }
                >
                    {/* Available Balance */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Saldo Disponível</Text>
                        <Text style={styles.cardValue}>
                            {formatBRL(data?.overview?.available_balance)}
                        </Text>
                    </View>

                    {/* Income Total */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Total Ganhos</Text>
                        <Text style={[styles.cardValue, { color: '#10b981' }]}>
                            {formatBRL(data?.overview?.total_income)}
                        </Text>
                    </View>

                    {/* Expenses Total */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Total Despesas</Text>
                        <Text style={[styles.cardValue, { color: '#ef4444' }]}>
                            {formatBRL(data?.overview?.total_expenses)}
                        </Text>
                    </View>

                    {/* Installments Summary */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Resumo de Parcelas</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Compras ativas</Text>
                            <Text style={styles.value}>
                                {data?.installments?.active_purchases_count ?? 0}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Total de parcelas</Text>
                            <Text style={styles.value}>
                                {data?.installments?.total_installments_count ?? 0}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.label}>Valor total</Text>
                            <Text style={[styles.value, { color: '#6366f1' }]}>
                                {formatBRL(data?.installments?.total_amount)}
                            </Text>
                        </View>
                    </View>

                    {/* Categories Breakdown */}
                    {data?.categories_breakdown && data.categories_breakdown.length > 0 ? (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Categorias</Text>
                            {data.categories_breakdown.map((cat) => (
                                <View key={cat.category} style={styles.summaryRow}>
                                    <Text style={styles.label}>{cat.category}</Text>
                                    <Text style={[styles.value, { color: '#6366f1' }]}>
                                        {formatBRL(cat.amount)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Nenhuma categoria encontrada para este período
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardTitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    label: {
        fontSize: 14,
        color: '#6b7280',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    emptyContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
});
