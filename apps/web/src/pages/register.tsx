import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import { decodeJwtPayload, extractErrorMessage } from '@cointrack/utils';
import {
  DollarSign,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Alert, Button, Input } from '@/components/ui';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({ name, email, password, level: 'user' });
      const loginResponse = await authService.login({ email, password });
      const token = loginResponse.message?.token;

      if (!token || typeof token !== 'string') {
        throw new Error('Resposta inválida do servidor');
      }

      const payload = decodeJwtPayload(token);
      const userData = {
        id: payload.user_id || payload.sub || '',
        name: payload.name || name,
        email: payload.email || email,
      };
      login(token, userData);
    } catch (err) {
      setError(
        extractErrorMessage(err, 'Erro ao criar conta. Tente novamente.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] items-center justify-center p-12">
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0EA5E9]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#10B981]/15 blur-3xl" />

        <div className="relative max-w-md text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight block leading-none">
                CoinTrack
              </span>
              <span className="text-xs font-medium text-[#38BDF8]">
                Gestão Financeira Inteligente
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Comece a organizar suas finanças hoje
          </h1>
          <p className="text-base text-slate-200 leading-relaxed">
            Crie sua conta gratuitamente e tenha controle completo dos seus
            ganhos, despesas, faturas e metas em tempo real.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CoinTrack</span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-[var(--shadow-sm)]">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">
              Criar uma nova conta
            </h2>
            <p className="text-sm text-muted mb-6">
              Preencha os dados abaixo para começar.
            </p>

            {error && (
              <Alert
                variant="error"
                message={error}
                onDismiss={() => setError('')}
                className="mb-5"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                label="Nome completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                placeholder="Seu nome completo"
                required
              />

              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="seu@email.com"
                required
              />

              <Input
                id="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-muted hover:text-accent cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                placeholder="Mínimo 6 caracteres"
                required
              />

              <Input
                id="confirmPassword"
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Repita a senha"
                required
              />

              <Button
                type="submit"
                size="lg"
                loading={isLoading}
                className="w-full mt-2"
              >
                {!isLoading && (
                  <>
                    Criar conta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6 pt-5 border-t border-border">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-accent hover:text-accent-hover font-semibold"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
