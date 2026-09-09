import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    destructive?: boolean;
}

export function ConfirmDialog({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirmar',
    destructive = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar"
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                            accessibilityRole="button"
                            accessibilityLabel={confirmLabel}
                        >
                            <Text
                                style={[
                                    styles.confirmText,
                                    destructive && styles.destructiveText,
                                ]}
                            >
                                {confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dialog: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 340,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    confirmButton: {
        backgroundColor: '#F3F4F6',
    },
    confirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    destructiveText: {
        color: '#DC2626',
    },
});
