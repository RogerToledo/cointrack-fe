import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatBRL, formatDateBR } from '@cointrack/utils';

import { MonthPicker } from '../../../components/MonthPicker';
import { PullToRefreshList } from '../../../components/PullToRefreshList';
import { SwipeableRow } from '../../../components/SwipeableRow';
import { useMonthNavigation } from '../../../hooks/useMonthNavigation';
import { usePurchases } from '../../../hooks/usePurchases';
import { theme } from '../../../constants/theme';

export default function PurchasesScreen() {
  const { currentMonth, setCurrentMonth } = useMonthNavigation();
  const { data, loading, error, refreshing, refresh, remove, page, totalPages, nextPage, prevPage } =
    usePurchases(currentMonth);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MonthPicker currentMonth={currentMonth} onSelect={setCurrentMonth} />
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
                    <Text style={styles.itemDate}>{formatDateBR(item.date)}</Text>
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
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                onPress={prevPage}
                disabled={page <= 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page <= 1 ? theme.colors.placeholder : theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.pageText}>
                {page} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
                onPress={nextPage}
                disabled={page >= totalPages}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={page >= totalPages ? theme.colors.placeholder : theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/purchases/form')}
        accessibilityRole="button"
        accessibilityLabel="Adicionar compra"
      >
        <Ionicons name="add" size={28} color={theme.colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  itemContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDate: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  badge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: theme.colors.secondary,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
