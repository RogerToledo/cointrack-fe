import React, { useState } from 'react';
import { inviteMember } from '@/services/family';
import { extractErrorMessage } from '@cointrack/utils';
import { useToast } from '@/contexts/ToastContext';
import { Mail } from 'lucide-react';
import { Alert, Button, Input, Modal } from '@/components/ui';

interface ModalInviteMemberProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  familyId: string;
}

export default function ModalInviteMember({
  isOpen,
  onClose,
  onSuccess,
  familyId,
}: ModalInviteMemberProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await inviteMember(familyId, email);
      toast.success('Convite enviado com sucesso!');
      setEmail('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao enviar convite.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Convidar Membro"
      subtitle="Envie um convite por email para compartilhar esta família"
      size="sm"
    >
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError('')}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="invite-email"
          label="Email do Membro"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="email@exemplo.com"
          hint="O convidado poderá aceitar o convite na tela de Família."
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Enviar Convite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
