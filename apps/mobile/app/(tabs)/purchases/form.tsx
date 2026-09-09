import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { FormInput } from '../../../components/FormInput';
import { validatePurchaseForm, type PurchaseFormValues, type FieldErrors } from '../../../utils/validation';
import { extractErrorMessage } from '../../../utils/errorMessage';
import { apiClient } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';

interface PurchaseType {
    id: string;
    name: string;
}

interface PaymentType {
    id: string;
    name: string;
    spot_payment: number;
}

interface CreditCard {
    id: string;
    owner: string;
    final_card_num: string;
    name?: string;
}

function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const defaultFormValues: PurchaseFormValues = {
    description: '',
    amount: null,
    date: getTodayDate(),
    purchase_type_id: '',
    payment_type_id: '',
    credit_card_id: '',
    installments: null,
    is_credit_card_payment: false,
};

export default function PurchaseFormScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!id;
    const router = useRouter();
    const toast = useToast();

    const [values, setValues] = useState<PurchaseFormValues>(defaultFormValues);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Selector data
    const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

    // Selector modal state
    const [selectorVisible, setSelectorVisible] = useState(false);
    const [selectorTitle, setSelectorTitle] = useState('');
    const [selectorOptions, setSelectorOptions] = useState<{ id: string; label: string }[]>([]);
    const [selectorField, setSelectorField] = useState<string>('');

    // Selected display names
    const [purchaseTypeName, setPurchaseTypeName] = useState('');
    const [paymentTypeName, setPaymentTypeName] = useState('');
    const [creditCardName, setCreditCardName] = useState('');

    // Load metadata (purchase types, payment types, credit cards)
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                const [ptRes, payRes, ccRes] = await Promise.all([
                    apiClient.get('/v1/purchaseTypes'),
                    apiClient.get('/v1/paymentTypes'),
                    apiClient.get('/v1/creditCards'),
                ]);
                const ptData = Array.isArray(ptRes.data?.message) ? ptRes.data.message : [];
                const payData = Array.isArray(payRes.data?.message) ? payRes.data.message : [];
                const ccData = Array.isArray(ccRes.data?.message) ? ccRes.data.message : [];
                setPurchaseTypes(ptData);
                setPaymentTypes(payData);
                setCreditCards(ccData);
            } catch {
                // Metadata load failure is non-blocking; selectors will be empty
            }
        };
        loadMetadata();
    }, []);

    // Load existing purchase if editing
    useEffect(() => {
        if (!id) return;
        const loadPurchase = async () => {
            setLoadingData(true);
            try {
                const res = await apiClient.get(`/v1/purchases/${id}`);
                const data = res.data?.message;
                if (data) {
                    const isCreditCard = checkIsCreditCardPayment(data.payment_type_id);
                    setValues({
                        description: data.description || '',
                        amount: data.amount ?? null,
                        date: data.date || '',
                        purchase_type_id: data.purchase_type_id || '',
                        payment_type_id: data.payment_type_id || '',
                        credit_card_id: data.credit_card_id || '',
                        installments: data.installment_number ?? null,
                        is_credit_card_payment: isCreditCard,
                    });
                    // Set display names
                    setPurchaseTypeName(data.purchase_type || '');
                    setPaymentTypeName(data.payment_type || '');
                    setCreditCardName(data.credit_card || '');
                }
            } catch (err) {
                toast.show(extractErrorMessage(err, 'Erro ao carregar compra'), 'error');
            } finally {
                setLoadingData(false);
            }
        };
        loadPurchase();
    }, [id]);

    function checkIsCreditCardPayment(paymentTypeId: string): boolean {
        const pt = paymentTypes.find((p) => p.id === paymentTypeId);
        return pt?.name?.toLowerCase().includes('cartão de crédito') ?? false;
    }

    function handlePaymentTypeChange(paymentTypeId: string) {
        const pt = paymentTypes.find((p) => p.id === paymentTypeId);
        const isCreditCard = pt?.name?.toLowerCase().includes('cartão de crédito') ?? false;

        setValues((prev) => ({
            ...prev,
            payment_type_id: paymentTypeId,
            is_credit_card_payment: isCreditCard,
            credit_card_id: isCreditCard ? prev.credit_card_id : '',
            installments: isCreditCard ? prev.installments : null,
        }));
        setPaymentTypeName(pt?.name || '');

        if (!isCreditCard) {
            setCreditCardName('');
        }
    }

    function openSelector(field: string, title: string, options: { id: string; label: string }[]) {
        setSelectorField(field);
        setSelectorTitle(title);
        setSelectorOptions(options);
        setSelectorVisible(true);
    }

    function handleSelectorSelect(optionId: string, optionLabel: string) {
        setSelectorVisible(false);

        if (selectorField === 'purchase_type_id') {
            setValues((prev) => ({ ...prev, purchase_type_id: optionId }));
            setPurchaseTypeName(optionLabel);
        } else if (selectorField === 'payment_type_id') {
            handlePaymentTypeChange(optionId);
        } else if (selectorField === 'credit_card_id') {
            setValues((prev) => ({ ...prev, credit_card_id: optionId }));
            setCreditCardName(optionLabel);
        }

        // Clear error for the field
        if (errors[selectorField]) {
            setErrors((prev) => ({ ...prev, [selectorField]: undefined }));
        }
    }

    function handleFieldChange(field: keyof PurchaseFormValues, text: string) {
        if (field === 'amount') {
            const numericValue = text ? parseFloat(text.replace(',', '.')) : null;
            setValues((prev) => ({ ...prev, amount: numericValue }));
        } else if (field === 'installments') {
            const intValue = text ? parseInt(text, 10) : null;
            setValues((prev) => ({ ...prev, installments: intValue }));
        } else {
            setValues((prev) => ({ ...prev, [field]: text }));
        }

        // Clear error for the field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    async function handleSubmit() {
        const fieldErrors = validatePurchaseForm(values);
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                description: values.description.trim(),
                amount: values.amount,
                date: values.date,
                installment_number: values.installments || 0,
                place: '',
                paid: values.is_credit_card_payment,
                payment_type_id: values.payment_type_id,
                credit_card_id: values.credit_card_id || '',
                purchase_type_id: values.purchase_type_id,
                person_id: '',
            };

            if (isEditing) {
                await apiClient.put('/v1/purchases', { id, ...payload });
                toast.show('Compra atualizada', 'success');
            } else {
                await apiClient.post('/v1/purchases', payload);
                toast.show('Compra criada', 'success');
            }
            router.back();
        } catch (err) {
            toast.show(extractErrorMessage(err, 'Erro ao salvar compra'), 'error');
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: 'Compra' }} />
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen options={{ title: isEditing ? 'Editar Compra' : 'Nova Compra' }} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Description */}
                <FormInput
                    label="Descrição"
                    value={values.description}
                    onChangeText={(text) => handleFieldChange('description', text)}
                    error={errors.description}
                    placeholder="Descrição da compra"
                    maxLength={200}
                />

                {/* Amount */}
                <FormInput
                    label="Valor (R$)"
                    value={values.amount !== null ? String(values.amount) : ''}
                    onChangeText={(text) => handleFieldChange('amount', text)}
                    error={errors.amount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                />

                {/* Date */}
                <FormInput
                    label="Data"
                    value={values.date}
                    onChangeText={(text) => handleFieldChange('date', text)}
                    error={errors.date}
                    placeholder="YYYY-MM-DD"
                />

                {/* Purchase Type Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={styles.selectorLabel}>Tipo de Compra</Text>
                    <TouchableOpacity
                        style={[styles.selectorButton, !!errors.purchase_type_id && styles.selectorButtonError]}
                        onPress={() =>
                            openSelector(
                                'purchase_type_id',
                                'Tipo de Compra',
                                purchaseTypes.map((pt) => ({ id: pt.id, label: pt.name }))
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Selecionar tipo de compra"
                    >
                        <Text style={[styles.selectorText, !purchaseTypeName && styles.selectorPlaceholder]}>
                            {purchaseTypeName || 'Selecione o tipo de compra'}
                        </Text>
                    </TouchableOpacity>
                    {!!errors.purchase_type_id && (
                        <Text style={styles.errorText}>{errors.purchase_type_id}</Text>
                    )}
                </View>

                {/* Payment Type Selector */}
                <View style={styles.selectorContainer}>
                    <Text style={styles.selectorLabel}>Tipo de Pagamento</Text>
                    <TouchableOpacity
                        style={[styles.selectorButton, !!errors.payment_type_id && styles.selectorButtonError]}
                        onPress={() =>
                            openSelector(
                                'payment_type_id',
                                'Tipo de Pagamento',
                                paymentTypes.map((pt) => ({ id: pt.id, label: pt.name }))
                            )
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Selecionar tipo de pagamento"
                    >
                        <Text style={[styles.selectorText, !paymentTypeName && styles.selectorPlaceholder]}>
                            {paymentTypeName || 'Selecione o tipo de pagamento'}
                        </Text>
                    </TouchableOpacity>
                    {!!errors.payment_type_id && (
                        <Text style={styles.errorText}>{errors.payment_type_id}</Text>
                    )}
                </View>

                {/* Credit Card Selector (conditional) */}
                {values.is_credit_card_payment && (
                    <View style={styles.selectorContainer}>
                        <Text style={styles.selectorLabel}>Cartão de Crédito</Text>
                        <TouchableOpacity
                            style={[styles.selectorButton, !!errors.credit_card_id && styles.selectorButtonError]}
                            onPress={() =>
                                openSelector(
                                    'credit_card_id',
                                    'Cartão de Crédito',
                                    creditCards.map((cc) => ({
                                        id: cc.id,
                                        label: cc.name || `${cc.owner} - ${cc.final_card_num}`,
                                    }))
                                )
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Selecionar cartão de crédito"
                        >
                            <Text style={[styles.selectorText, !creditCardName && styles.selectorPlaceholder]}>
                                {creditCardName || 'Selecione o cartão'}
                            </Text>
                        </TouchableOpacity>
                        {!!errors.credit_card_id && (
                            <Text style={styles.errorText}>{errors.credit_card_id}</Text>
                        )}
                    </View>
                )}

                {/* Installments (conditional) */}
                {values.is_credit_card_payment && (
                    <FormInput
                        label="Parcelas"
                        value={values.installments !== null ? String(values.installments) : ''}
                        onChangeText={(text) => handleFieldChange('installments', text)}
                        error={errors.installments}
                        placeholder="1-48"
                        keyboardType="number-pad"
                    />
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityLabel={isEditing ? 'Atualizar compra' : 'Criar compra'}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEditing ? 'Atualizar Compra' : 'Criar Compra'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Selector Modal */}
            <Modal
                visible={selectorVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectorVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectorTitle}</Text>
                            <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                                <Text style={styles.modalClose}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={selectorOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleSelectorSelect(item.id, item.label)}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.modalOptionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.modalEmpty}>
                                    <Text style={styles.modalEmptyText}>Nenhuma opção disponível</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    selectorContainer: {
        marginBottom: 16,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    selectorButton: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },
    selectorButtonError: {
        borderColor: '#E53935',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    selectorPlaceholder: {
        color: '#999',
    },
    errorText: {
        fontSize: 12,
        color: '#E53935',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#6366f1',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    modalClose: {
        fontSize: 16,
        color: '#6366f1',
        fontWeight: '500',
    },
    modalOption: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalEmpty: {
        padding: 24,
        alignItems: 'center',
    },
    modalEmptyText: {
        fontSize: 14,
        color: '#6b7280',
    },
});
