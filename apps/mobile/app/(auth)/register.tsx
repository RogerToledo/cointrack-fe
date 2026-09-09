import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { validateRegisterForm, type FieldErrors } from '../../utils/validation';
import { extractErrorMessage } from '../../utils/errorMessage';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async () => {
        setApiError('');
        setErrors({});

        const fieldErrors = validateRegisterForm({
            name,
            email,
            password,
            passwordConfirmation,
        });

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Register the user
            await authService.register({ name, email, password });

            // Login after successful registration
            const loginResponse = await authService.login({ email, password });
            const token = loginResponse.message?.token;

            if (!token || typeof token !== 'string') {
                throw new Error('Token não recebido do servidor');
            }

            // Decode JWT to extract user data
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const userData = {
                    id: payload.user_id || payload.sub || '',
                    name: payload.name || name,
                    email: payload.email || email,
                };
                await login(token, userData);
            } else {
                throw new Error('Formato de token inválido');
            }
        } catch (err) {
            const message = extractErrorMessage(err, 'Erro ao criar conta. Tente novamente.');
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.flex}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>Criar conta</Text>
                        <Text style={styles.subtitle}>
                            Preencha seus dados para começar a controlar suas finanças.
                        </Text>

                        {!!apiError && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{apiError}</Text>
                            </View>
                        )}

                        <FormInput
                            label="Nome"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            placeholder="Seu nome"
                        />

                        <FormInput
                            label="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                        />

                        <FormInput
                            label="Senha"
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry
                        />

                        <FormInput
                            label="Confirmar senha"
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            error={errors.passwordConfirmation}
                            placeholder="Repita a senha"
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Criar conta</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.push('/login')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.loginLinkText}>
                                Já tem conta? <Text style={styles.loginLinkBold}>Fazer login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 24,
    },
    errorBanner: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorBannerText: {
        color: '#DC2626',
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: '#2563EB',
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
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginLinkText: {
        fontSize: 14,
        color: '#666',
    },
    loginLinkBold: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
