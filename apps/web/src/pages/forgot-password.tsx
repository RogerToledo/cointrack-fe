import React, { useState } from 'react';
import Link from 'next/link';
import authService from '@/services/auth';
import { extractErrorMessage } from '@cointrack/utils';
import { DollarSign, Mail, ArrowLeft } from 'lucide-react';
import { Alert, Button, Card, Input } from '@/components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(
        'Um email com instruções para redefinir sua senha foi enviado para o seu endereço.'
      );
      setEmail('');
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          'Erro ao enviar email de recuperação. Tente novamente.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xs">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            CoinTrack
          </span>
        </div>

        <Card padding="lg" className="shadow-[var(--shadow-sm)]">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">
            Recuperar senha
          </h2>
          <p className="text-sm text-muted mb-6">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>

          {error && (
            <Alert
              variant="error"
              message={error}
              onDismiss={() => setError('')}
              className="mb-5"
            />
          )}

          {success && (
            <Alert
              variant="success"
              message={success}
              onDismiss={() => setSuccess('')}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Enviar instruções
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-accent hover:text-accent-hover font-medium pt-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </form>
        </Card>
      </div>
    </div>
  );
}
