import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getPendingInvites,
  acceptInvite,
  rejectInvite,
  FamilyInvite,
} from '@/services/family';
import { extractErrorMessage } from '@cointrack/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useToast } from '@/contexts/ToastContext';
import {
  Users,
  UserPlus,
  Mail,
  Check,
  X as XIcon,
  Plus,
  Crown,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  SkeletonBlock,
} from '@/components/ui';
import ModalFamily from './ModalFamily';
import ModalInviteMember from './ModalInviteMember';

export default function Family() {
  const { user } = useAuth();
  const { selectedFamily, refreshFamilies } = useFamily();
  const toast = useToast();
  const [pendingInvites, setPendingInvites] = useState<FamilyInvite[]>([]);
  const [isModalFamilyOpen, setIsModalFamilyOpen] = useState(false);
  const [isModalInviteOpen, setIsModalInviteOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionInviteId, setActionInviteId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const loadFamilyData = useCallback(
    async (force = false) => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      if (force) {
        isLoadingRef.current = false;
      }

      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoading(true);
      setError('');

      try {
        const invitesResponse = await getPendingInvites();
        setPendingInvites(
          Array.isArray(invitesResponse.message) ? invitesResponse.message : []
        );
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) {
          setError(extractErrorMessage(err, 'Erro ao carregar convites.'));
        }
        setPendingInvites([]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [user?.id]
  );

  useEffect(() => {
    loadFamilyData();
    return () => {
      isLoadingRef.current = false;
    };
  }, [loadFamilyData]);

  const handleAcceptInvite = async (inviteId: string) => {
    setActionInviteId(inviteId);
    try {
      await acceptInvite(inviteId);
      toast.success('Convite aceito com sucesso!');
      await refreshFamilies();
      await loadFamilyData(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erro ao aceitar convite.'));
    } finally {
      setActionInviteId(null);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setActionInviteId(inviteId);
    try {
      await rejectInvite(inviteId);
      toast.info('Convite recusado.');
      await loadFamilyData(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erro ao recusar convite.'));
    } finally {
      setActionInviteId(null);
    }
  };

  const handleFamilyCreated = async () => {
    await refreshFamilies();
    await loadFamilyData(true);
  };

  if (isLoading) {
    return (
      <Card className="space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-16 w-full rounded-xl" />
        <SkeletonBlock className="h-16 w-full rounded-xl" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError('')} />
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card className="border-accent/30 bg-accent-light/40">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-foreground">
              Convites Pendentes
            </h3>
            <Badge variant="info">{pendingInvites.length}</Badge>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Família: {invite.family_name}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Convidado: {invite.person_name} ·{' '}
                    {new Date(invite.invited_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    loading={actionInviteId === invite.id}
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleAcceptInvite(invite.id)}
                  >
                    Aceitar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={actionInviteId === invite.id}
                    icon={<XIcon className="w-3.5 h-3.5" />}
                    onClick={() => handleRejectInvite(invite.id)}
                  >
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Family Info */}
      {!selectedFamily ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Você ainda não tem uma família"
          description="Crie um grupo familiar para compartilhar compras, cartões, despesas e ganhos com outras pessoas."
          action={
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalFamilyOpen(true)}
            >
              Criar Família
            </Button>
          }
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedFamily.name}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {selectedFamily.members?.length || 0} membro(s) ativo(s)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalFamilyOpen(true)}
              >
                Nova Família
              </Button>
              <Button
                size="sm"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={() => setIsModalInviteOpen(true)}
              >
                Convidar Membro
              </Button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Membros do Grupo
            </h3>

            {selectedFamily.members && selectedFamily.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFamily.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-background border border-border"
                  >
                    <div className="h-10 w-10 rounded-xl bg-foreground text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      {member.person_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {member.person_name}
                        </p>
                        {member.role === 'owner' && (
                          <Badge variant="info">
                            <Crown className="w-3 h-3" />
                            Dono
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {member.person_email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-6">
                Nenhum membro na família ainda.
              </p>
            )}
          </div>
        </Card>
      )}

      <ModalFamily
        isOpen={isModalFamilyOpen}
        onClose={() => setIsModalFamilyOpen(false)}
        onSuccess={handleFamilyCreated}
      />

      {selectedFamily && (
        <ModalInviteMember
          isOpen={isModalInviteOpen}
          onClose={() => setIsModalInviteOpen(false)}
          onSuccess={() => loadFamilyData(true)}
          familyId={selectedFamily.id}
        />
      )}
    </div>
  );
}
