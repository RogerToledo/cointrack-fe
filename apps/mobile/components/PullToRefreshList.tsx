import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, ListRenderItemInfo } from 'react-native';
import { LoadingScreen } from './LoadingScreen';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

interface PullToRefreshListProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactElement | null;
    onRefresh: () => Promise<void>;
    refreshing: boolean;
    loading: boolean;
    error: string | null;
    emptyMessage?: string;
    onRetry?: () => void;
    keyExtractor: (item: T) => string;
}

export function PullToRefreshList<T>({
    data,
    renderItem,
    onRefresh,
    refreshing,
    loading,
    error,
    emptyMessage = 'Nenhum item encontrado',
    onRetry,
    keyExtractor,
}: PullToRefreshListProps<T>) {
    const handleRenderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<T>) => renderItem(item, index),
        [renderItem]
    );

    if (loading && data.length === 0) {
        return <LoadingScreen />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (data.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <FlatList
            data={data}
            renderItem={handleRenderItem}
            keyExtractor={keyExtractor}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
    },
});
