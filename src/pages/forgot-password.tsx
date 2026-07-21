import React, { useState } from 'react';
import Link from 'next/link';
import authService from '@/services/auth';
import { ApiError } from '@/types/api';
import { DollarSign, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

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
      setSuccess('Um email com instruções para redefinir sua senha foi enviado para o seu email.');
      setEmail('');
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.message || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">CoinTrack</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Recuperar senha
          </h2>
          <p className="text-muted mb-6">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-light border border-danger/20 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-danger text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-success-light border border-success/20 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Enviar instruções'
              )}
            </button>

            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
