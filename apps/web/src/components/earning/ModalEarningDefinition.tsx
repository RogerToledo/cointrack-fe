import React, { useState, useEffect } from 'react';
import {
  createEarningDefinition,
  getEarningBy,
  updateEarning,
  PERIODICITIES,
} from '@/services/earning';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { useToast } from '@/contexts/ToastContext';
import { Person } from '@/services/person';
import { extractErrorMessage, logApiError } from '@cointrack/utils';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  isUpdate: boolean;
  earningId: string;
}

const ModalEarningDefinition: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isUpdate,
  earningId,
}) => {
  const toast = useToast();
  const [earningOwner, setEarningOwner] = useState('');
  const [description, setDescription] = useState('');
  const [periodicity, setPeriodicity] = useState('MENSAL');
  const [ownerList, setOwnerList] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { selectedFamily } = useFamily();

  const isViewOnly = !isUpdate && earningId !== '';
  const isCreateMode = !isUpdate && !isViewOnly;

  const getTitle = () => {
    if (isUpdate) return 'Atualizar Ganho';
    if (isViewOnly) return 'Detalhes do Ganho';
    return 'Nova Fonte de Ganho';
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      setError(null);
      try {
        let owners: Person[] = [];
        if (selectedFamily?.members && selectedFamily.members.length > 0) {
          owners = selectedFamily.members.map((m) => ({
            id: m.person_id,
            name: m.person_name,
          }));
        } else if (user) {
          owners = [{ id: user.id, name: user.name }];
        }
        setOwnerList(owners);

        if (earningId && (isUpdate || isViewOnly)) {
          const earningResponse = await getEarningBy(earningId);
          const earningData = earningResponse.message;
          setEarningOwner(earningData.idUser || '');
          setDescription(earningData.description || '');
          setPeriodicity(earningData.periodicity || 'MENSAL');
        } else {
          setDescription('');
          setPeriodicity('MENSAL');
          setEarningOwner(owners.length === 1 ? owners[0].id : '');
        }
      } catch (err) {
        logApiError('loadInitialData (modal de ganho)', err);
        setError(
          extractErrorMessage(err, 'Ocorreu um erro inesperado ao carregar os dados.')
        );
      }
    };

    loadInitialData();
  }, [isOpen, isUpdate, earningId, isViewOnly, selectedFamily?.members, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Por favor, preencha a descrição.');
      return;
    }

    if (!earningOwner) {
      setError('Por favor, selecione um proprietário válido.');
      return;
    }

    setIsLoading(true);
    try {
      if (isCreateMode) {
        await createEarningDefinition({
          description: description.trim(),
          id_user: earningOwner,
          periodicity,
        });
        toast.success('Ganho cadastrado com sucesso!');
      } else {
        await updateEarning(earningId, {
          description: description.trim(),
          id_user: earningOwner,
          periodicity,
        });
        toast.success('Ganho atualizado com sucesso!');
      }

      onSaved();
      onClose();
    } catch (err) {
      logApiError(isUpdate ? 'updateEarning' : 'createEarningDefinition', err);
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="def-owner"
          label="Proprietário"
          value={earningOwner}
          onChange={(e) => setEarningOwner(e.target.value)}
          disabled={isLoading || isViewOnly}
          required
        >
          <option value="">Escolha o proprietário do ganho</option>
          {ownerList.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </Select>

        <Input
          id="def-description"
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading || isViewOnly}
          placeholder="Ex: Salário, Freelance, Dividendos"
          required
        />

        <Select
          id="def-periodicity"
          label="Periodicidade"
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value)}
          disabled={isLoading || isViewOnly}
          required
        >
          {PERIODICITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {isViewOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" loading={isLoading}>
              Salvar
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalEarningDefinition;
