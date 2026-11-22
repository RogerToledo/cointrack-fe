import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import authService from '@/services/auth';
import { extractErrorMessage } from '@cointrack/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserCircle, Mail, Lock, Pencil } from 'lucide-react';
import { Button, Card, Input, PageHeader } from '@/components/ui';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isEditingProfile) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isEditingProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile({ name, email });
      updateUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erro ao atualizar perfil.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      toast.success('Senha atualizada com sucesso!');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erro ao atualizar senha.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais e credenciais de segurança"
        />

        {/* Profile Info Card */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-border">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1D4ED8] flex items-center justify-center shadow-xs">
                <span className="text-white text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Informações Pessoais
                </h2>
                <p className="text-xs text-muted">Seus dados de cadastro</p>
              </div>
            </div>
            {!isEditingProfile && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => setIsEditingProfile(true)}
              >
                Editar
              </Button>
            )}
          </div>

          <div className="p-6">
            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border">
                  <UserCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted font-medium uppercase tracking-wider">
                      Nome
                    </p>
                    <p className="text-sm text-foreground font-semibold truncate">
                      {user?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted font-medium uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm text-foreground font-semibold truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  id="name"
                  label="Nome"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" loading={isLoading}>
                    Salvar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Password Card */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-border">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Alterar Senha
                </h2>
                <p className="text-xs text-muted">Mantenha sua conta segura</p>
              </div>
            </div>
            {!isEditingPassword && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => setIsEditingPassword(true)}
              >
                Alterar
              </Button>
            )}
          </div>

          {isEditingPassword && (
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  id="currentPassword"
                  label="Senha Atual"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  id="newPassword"
                  label="Nova Senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Input
                  id="confirmNewPassword"
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" loading={isLoading}>
                    Alterar Senha
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
