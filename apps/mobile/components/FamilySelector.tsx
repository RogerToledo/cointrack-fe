import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Family {
    id: string;
    name: string;
    created_by: string;
}

interface FamilySelectorProps {
    families: Family[];
    selectedFamily: Family | null;
    onSelect: (family: Family) => void;
}

function truncateName(name: string, maxLength: number = 30): string {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
}

export function FamilySelector({ families, selectedFamily, onSelect }: FamilySelectorProps) {
    const [visible, setVisible] = useState(false);

    // Hidden when user has only one family
    if (families.length <= 1) {
        return null;
    }

    const handleSelect = (family: Family) => {
        onSelect(family);
        setVisible(false);
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Selecionar família"
                accessibilityHint="Abre a lista de famílias para seleção"
            >
                <Text style={styles.triggerText} numberOfLines={1}>
                    {selectedFamily ? truncateName(selectedFamily.name) : 'Selecionar família'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#007AFF" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownTitle}>Selecionar família</Text>
                        <FlatList
                            data={families}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.familyItem,
                                        selectedFamily?.id === item.id && styles.familyItemActive,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                    accessibilityRole="button"
                                    accessibilityLabel={item.name}
                                    accessibilityState={{ selected: selectedFamily?.id === item.id }}
                                >
                                    <Text
                                        style={[
                                            styles.familyItemText,
                                            selectedFamily?.id === item.id && styles.familyItemTextActive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                    {selectedFamily?.id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007AFF',
        maxWidth: 200,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        maxWidth: 340,
        maxHeight: 400,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 12,
    },
    familyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    familyItemActive: {
        backgroundColor: '#F0F5FF',
    },
    familyItemText: {
        fontSize: 16,
        color: '#1C1C1E',
        flex: 1,
        marginRight: 8,
    },
    familyItemTextActive: {
        fontWeight: '600',
        color: '#007AFF',
    },
});
