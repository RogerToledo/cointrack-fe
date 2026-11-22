import React, { useState, useEffect } from 'react';
import { createPerson, getPeople, updatePerson } from '@/services/person';
import { extractErrorMessage } from '@cointrack/utils';
import { useToast } from '@/contexts/ToastContext';
import { Alert, Button, Input, Modal } from '@/components/ui';

interface ModalPersonProps {
  isOpen: boolean;
  onClose: () => void;
  onPersonAction: () => void;
  isUpdate: boolean;
  personId: string;
}

const ModalPerson: React.FC<ModalPersonProps> = ({
  isOpen,
  onClose,
  onPersonAction,
  isUpdate,
  personId,
}) => {
  const toast = useToast();
  const [personName, setPersonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (isUpdate && personId) {
      const fetchPerson = async () => {
        try {
          const response = await getPeople(personId);
          setPersonName(response.message.name);
        } catch (err) {
          setError(extractErrorMessage(err, 'Erro ao carregar pessoa.'));
        }
      };
      fetchPerson();
    } else {
      setPersonName('');
    }
  }, [isUpdate, personId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (isUpdate) {
        await updatePerson(personId, personName);
        toast.success('Pessoa atualizada com sucesso!');
      } else {
        await createPerson(personName);
        toast.success('Pessoa criada com sucesso!');
      }
      setPersonName('');
      onPersonAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar pessoa.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Atualizar Pessoa' : 'Nova Pessoa'}
      size="sm"
    >
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="personName"
          label="Nome"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Digite um nome"
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalPerson;
