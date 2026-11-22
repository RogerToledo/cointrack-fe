import React, { useState } from 'react';
import { createFamily } from '@/services/family';
import { extractErrorMessage } from '@cointrack/utils';
import { useToast } from '@/contexts/ToastContext';
import { Alert, Button, Input, Modal } from '@/components/ui';

interface ModalFamilyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalFamily({
  isOpen,
  onClose,
  onSuccess,
}: ModalFamilyProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await createFamily(name);
      setName('');
      toast.success('Família criada com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao criar família.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Família" size="sm">
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
          id="family-name"
          label="Nome da Família"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Família Silva"
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
