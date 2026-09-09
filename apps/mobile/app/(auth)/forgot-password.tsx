import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { validateForgotPasswordForm, type FieldErrors } from '../../utils/validation';
import { extractErrorMessage } from '../../utils/errorMessage';
import { authService } from '../../services/api';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        const fieldErrors = validateForgotPasswordForm({ email });
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await authService.forgotPassword(email.trim());
            setSuccessMessage('Verifique seu e-mail para redefinir a senha');
        } catch (error) {
            setErrorMessage(extractErrorMessage(error, 'Erro ao solicitar redefinição de senha'));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                    <Text style={styles.title}>Esqueceu a senha?</Text>
                    <Text style={styles.subtitle}>
                        Informe seu e-mail para receber as instruções de redefinição de senha.
                    </Text>

                    {!!successMessage && (
                        <View style={styles.successContainer}>
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    )}

                    {!!errorMessage && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    <FormInput
                        label="E-mail"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) {
                                setErrors((prev) => ({ ...prev, email: undefined }));
                            }
                        }}
                        error={errors.email}
                        placeholder="seu@email.com"
                        keyboardType="email-address"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Enviar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backLink}
                        onPress={handleBackToLogin}
                    >
                        <Text style={styles.backLinkText}>Voltar para login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    form: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    },
    successContainer: {
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    successText: {
        color: '#2E7D32',
        fontSize: 14,
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#C62828',
        fontSize: 14,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#1976D2',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    backLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    backLinkText: {
        color: '#1976D2',
        fontSize: 14,
        fontWeight: '500',
    },
});
