import React, { useState } from 'react';
import Link from 'next/link';
import authService from '@/services/auth';
import { ApiError } from '@/types/api';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Recuperar senha
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="seu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <div className="text-sm text-center">
              <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-500">
                Voltar para login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
