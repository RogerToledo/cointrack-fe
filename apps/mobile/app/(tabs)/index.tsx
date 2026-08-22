import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { createApiClient } from '@cointrack/services';
import { createDashboardService } from '@cointrack/services';
import { formatBRL } from '@cointrack/utils';
import { DashboardData } from '@cointrack/types';
import * as SecureStore from 'expo-secure-store';

const client = createApiClient({
    baseURL: 'http://localhost:8180',
    storage: {
        getToken: () => SecureStore.getItemAsync('token'),
        removeToken: () => SecureStore.deleteItemAsync('token'),
        removeUser: () => SecureStore.deleteItemAsync('user'),
    },
    onUnauthorized: () => {
        // TODO: navigate to login
    },
});

const dashboardService = createDashboardService(client);

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardScreen() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await dashboardService.getDashboard(getCurrentMonth());
            setData(response.message);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Não foi possível carregar os dados do dashboard.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Overview Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Disponível</Text>
                <Text style={styles.cardValue}>
                    {formatBRL(data?.overview?.available_balance)}
                </Text>
                <Text style={styles.cardTrend}>
                    {data?.overview?.available_percentage?.toFixed(2) ?? '0.00'}% do orçamento
                </Text>
            </View>

            {/* Summary */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Resumo</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Ganhos</Text>
                    <Text style={[styles.value, { color: '#10b981' }]}>
                        {formatBRL(data?.overview?.total_income)}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Despesas</Text>
                    <Text style={[styles.value, { color: '#ef4444' }]}>
                        {formatBRL(data?.overview?.total_expenses)}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Saldo</Text>
                    <Text style={[styles.value, { color: '#6366f1' }]}>
                        {formatBRL(data?.overview?.available_balance)}
                    </Text>
                </View>
            </View>

            {/* Installments */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Parcelamentos</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Compras parceladas</Text>
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

            {/* Categories */}
            {data?.categories_breakdown && data.categories_breakdown.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Tipo de compra</Text>
                    {[...data.categories_breakdown]
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((cat) => (
                            <View key={cat.category} style={styles.summaryRow}>
                                <Text style={styles.label}>{cat.category}</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <Text style={styles.mutedText}>{cat.percentage.toFixed(2)}%</Text>
                                    <Text style={[styles.value, { color: '#6366f1' }]}>
                                        {formatBRL(cat.amount)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    cardTrend: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
        marginTop: 8,
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
    mutedText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    error: {
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
        padding: 20,
    },
});
