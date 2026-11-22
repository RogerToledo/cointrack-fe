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
import { decodeJwtPayload, extractErrorMessage } from '@cointrack/utils';
import { FormInput } from '../../components/FormInput';
import { validateLoginForm, type FieldErrors } from '../../utils/validation';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const isSubmitEnabled =
        EMAIL_REGEX.test(email.trim()) && password.length > 0 && !loading;

    const handleSubmit = async () => {
        setErrors({});
        setApiError('');

        const fieldErrors = validateLoginForm({ email, password });
        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login({ email: email.trim(), password });

            const token = response.message?.token;
            if (!token || typeof token !== 'string') {
                throw new Error('Token não recebido do servidor');
            }

            const payload = decodeJwtPayload(token);
            const userData = {
                id: payload.user_id || payload.sub || '',
                name: payload.name || email.split('@')[0],
                email: payload.email || email.trim(),
            };

            await login(token, userData);
            router.replace('/');
        } catch (err) {
            setApiError(
                extractErrorMessage(err, 'Erro ao fazer login. Verifique suas credenciais.')
            );
        } finally {
            setLoading(false);
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
                        <Text style={styles.title}>Bem-vindo de volta</Text>
                        <Text style={styles.subtitle}>
                            Entre com suas credenciais para acessar sua conta.
                        </Text>

                        {!!apiError && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{apiError}</Text>
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
                            placeholder="seu@email.com"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <FormInput
                            label="Senha"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                                }
                            }}
                            placeholder="••••••••"
                            secureTextEntry
                            error={errors.password}
                        />

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !isSubmitEnabled && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isSubmitEnabled}
                            activeOpacity={0.7}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>Entrar</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => router.push('/forgot-password')}
                        >
                            <Text style={styles.linkText}>Esqueci minha senha</Text>
                        </TouchableOpacity>

                        <View style={styles.registerRow}>
                            <Text style={styles.registerLabel}>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.registerLink}>Criar conta</Text>
                            </TouchableOpacity>
                        </View>
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
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primaryDark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
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
        fontSize: 14,
        color: theme.colors.danger,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.surface,
    },
    link: {
        alignSelf: 'center',
        marginTop: 16,
    },
    linkText: {
        fontSize: 14,
        color: theme.colors.accent,
        fontWeight: '600',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    registerLabel: {
        fontSize: 14,
        color: theme.colors.muted,
    },
    registerLink: {
        fontSize: 14,
        color: theme.colors.accent,
        fontWeight: '600',
    },
});
