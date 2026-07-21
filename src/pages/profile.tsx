import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import { ApiError } from '@/types/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserCircle, Mail, Lock, Pencil, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ name, email });
      updateUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem'); return; }
    if (newPassword.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return; }
    setIsLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setSuccess('Senha atualizada com sucesso!');
      setIsEditingPassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.message || 'Erro ao atualizar senha.');
    } finally { setIsLoading(false); }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted mt-1">Gerencie suas informações pessoais e senha</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success-light border border-success/20">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white text-lg font-bold">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Informações Pessoais</h2>
                <p className="text-sm text-muted">Seus dados de cadastro</p>
              </div>
            </div>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all">
                <Pencil className="w-4 h-4" /> Editar
              </button>
            )}
          </div>
          <div className="p-6">
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <UserCircle className="w-5 h-5 text-muted" />
                  <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Nome</p><p className="text-sm text-foreground font-medium">{user?.name}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Mail className="w-5 h-5 text-muted" />
                  <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Email</p><p className="text-sm text-foreground font-medium">{user?.email}</p></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Nome</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all">{isLoading ? 'Salvando...' : 'Salvar'}</button>
                  <button type="button" onClick={() => { setIsEditingProfile(false); setName(user?.name || ''); setEmail(user?.email || ''); }} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Alterar Senha</h2>
                <p className="text-sm text-muted">Mantenha sua conta segura</p>
              </div>
            </div>
            {!isEditingPassword && (
              <button onClick={() => setIsEditingPassword(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all">
                <Pencil className="w-4 h-4" /> Alterar
              </button>
            )}
          </div>
          {isEditingPassword && (
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">Senha Atual</label>
                  <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" required />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">Nova Senha</label>
                  <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" required />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-foreground mb-2">Confirmar Nova Senha</label>
                  <input type="password" id="confirmNewPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all">{isLoading ? 'Alterando...' : 'Alterar Senha'}</button>
                  <button type="button" onClick={() => { setIsEditingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all">Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
