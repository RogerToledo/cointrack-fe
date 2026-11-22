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
import { decodeJwtPayload, extractErrorMessage } from '@cointrack/utils';
import { FormInput } from '../../components/FormInput';
import { validateRegisterForm, type FieldErrors } from '../../utils/validation';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';

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

            const payload = decodeJwtPayload(token);
            const userData = {
                id: payload.user_id || payload.sub || '',
                name: payload.name || name,
                email: payload.email || email,
            };
            await login(token, userData);
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
        backgroundColor: theme.colors.background,
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
        color: theme.colors.primaryDark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.muted,
        marginBottom: 24,
    },
    errorBanner: {
        backgroundColor: theme.colors.dangerLight,
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: theme.radius.md,
        padding: 12,
        marginBottom: 16,
    },
    errorBannerText: {
        color: theme.colors.danger,
        fontSize: 14,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginLinkText: {
        fontSize: 14,
        color: theme.colors.muted,
    },
    loginLinkBold: {
        color: theme.colors.accent,
        fontWeight: '600',
    },
});
