import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ConfirmDialog } from './ConfirmDialog';

interface SwipeableRowProps {
    onDelete: () => void;
    children: React.ReactNode;
}

export function SwipeableRow({ onDelete, children }: SwipeableRowProps) {
    const swipeableRef = useRef<Swipeable>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const renderRightActions = (
        _progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => setConfirmVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Excluir"
            >
                <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
        );
    };

    const handleConfirm = () => {
        setConfirmVisible(false);
        swipeableRef.current?.close();
        onDelete();
    };

    const handleCancel = () => {
        setConfirmVisible(false);
    };

    return (
        <View>
            <Swipeable
                ref={swipeableRef}
                renderRightActions={renderRightActions}
                overshootRight={false}
            >
                {children}
            </Swipeable>
            <ConfirmDialog
                visible={confirmVisible}
                title="Confirmar exclusão"
                message="Tem certeza que deseja excluir este item?"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                confirmLabel="Excluir"
                destructive
            />
        </View>
    );
}

const styles = StyleSheet.create({
    deleteAction: {
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
