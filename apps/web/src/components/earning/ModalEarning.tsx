import React, { useState, useEffect } from 'react';
import {
  createEarningRecord,
  getEarningBy,
  getEarnings,
  updateEarning,
  Earning,
  PERIODICITIES,
} from '@/services/earning';
import { Person } from '@/services/person';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { extractErrorMessage, logApiError } from '@cointrack/utils';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAction: () => void;
  isUpdate: boolean;
  earningId: string;
}

const INVALID_OWNER = '00000000-0000-0000-0000-000000000000';

function toNumber(value: string): number {
  return parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
}

const ModalEarning: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCardAction,
  isUpdate,
  earningId,
}) => {
  const toast = useToast();
  const [earningOwner, setEarningOwner] = useState('');
  const [description, setDescription] = useState('');
  const [grossPay, setGrossPay] = useState('');
  const [netPay, setNetPay] = useState('');
  const [date, setDate] = useState('');
  const [periodicity, setPeriodicity] = useState('MENSAL');
  const [ownerList, setOwnerList] = useState<Person[]>([]);
  const [earningOptions, setEarningOptions] = useState<Earning[]>([]);
  const [selectedEarningId, setSelectedEarningId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFamily } = useFamily();
  const { user } = useAuth();

  const isViewOnly = !isUpdate && earningId !== '';
  const isCreateMode = !isUpdate && !isViewOnly;
  const recordEditable = isCreateMode && selectedEarningId !== '';

  const getTitle = () => {
    if (isUpdate) return 'Atualizar Ganho';
    if (isViewOnly) return 'Detalhes do Ganho';
    return 'Novo Registro de Ganho';
  };

  const loadDescriptions = async (ownerId: string) => {
    if (!ownerId || ownerId === INVALID_OWNER) {
      setEarningOptions([]);
      return;
    }

    try {
      const allEarnings = await getEarnings(undefined, undefined, ownerId);
      const owned = Array.isArray(allEarnings?.message)
        ? allEarnings.message.filter((earning: Earning) => earning.idUser === ownerId)
        : [];
      setEarningOptions(owned);
    } catch (earningError) {
      logApiError('getEarnings (earning modal)', earningError);
      setEarningOptions([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setError(null);
      if (!isOpen) return;

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

        if (earningId && earningId !== '' && (isUpdate || isViewOnly)) {
          const earningResponse = await getEarningBy(earningId);
          const earningData = earningResponse.message;
          const ownerId = earningData.idUser || INVALID_OWNER;
          const dateFormatted = earningData.record?.date
            ? earningData.record.date.split('T')[0]
            : '';

          setEarningOwner(ownerId);
          setDescription(earningData.description);
          setGrossPay(earningData.record?.gross_pay?.toString() || '');
          setNetPay(earningData.record?.net_pay?.toString() || '');
          setDate(dateFormatted);
          setPeriodicity(earningData.periodicity || 'MENSAL');
        } else {
          setDescription('');
          setGrossPay('');
          setNetPay('');
          setDate('');
          setPeriodicity('MENSAL');
          setSelectedEarningId('');
          setEarningOptions([]);

          if (owners.length === 1) {
            setEarningOwner(owners[0].id);
            await loadDescriptions(owners[0].id);
          } else {
            setEarningOwner('');
          }
        }
      } catch (err) {
        logApiError('loadInitialData (earning modal)', err);
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

    if (!earningOwner || earningOwner === INVALID_OWNER) {
      setError('Por favor, selecione um proprietário válido.');
      return;
    }

    setIsSaving(true);
    try {
      if (isCreateMode) {
        if (!selectedEarningId) {
          setError('Por favor, selecione um ganho.');
          return;
        }
        if (!date) {
          setError('Por favor, selecione uma data válida.');
          return;
        }

        const grossPayNumber = toNumber(grossPay);
        const netPayNumber = toNumber(netPay);
        if (isNaN(grossPayNumber) || isNaN(netPayNumber)) {
          setError('Por favor, preencha o bruto e o líquido com valores válidos.');
          return;
        }

        await createEarningRecord({
          id_earning: selectedEarningId,
          date,
          gross_pay: grossPayNumber,
          net_pay: netPayNumber,
        });
        toast.success('Registro de ganho criado com sucesso!');
      } else {
        await updateEarning(earningId, {
          description,
          id_user: earningOwner || user?.id || '',
          periodicity,
        });
        toast.success('Ganho atualizado com sucesso!');
      }

      onCardAction();
      onClose();
    } catch (err) {
      logApiError(isUpdate ? 'updateEarning' : 'createEarningRecord', err);
      setError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOwnerSelect = async (id: string) => {
    setEarningOwner(id);
    setSelectedEarningId('');
    setDescription('');
    setPeriodicity('MENSAL');
    setGrossPay('');
    setNetPay('');
    await loadDescriptions(id);
  };

  const handleEarningSelect = (id: string) => {
    setSelectedEarningId(id);
    const found = earningOptions.find((e) => e.id === id);
    if (found) {
      setDescription(found.description);
      setPeriodicity(found.periodicity || 'MENSAL');
    } else {
      setDescription('');
      setPeriodicity('MENSAL');
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
          id="earning-owner"
          label="Proprietário"
          value={earningOwner}
          onChange={(e) =>
            isCreateMode ? handleOwnerSelect(e.target.value) : setEarningOwner(e.target.value)
          }
          disabled={isViewOnly}
          required
        >
          <option value="">Escolha o proprietário do ganho</option>
          {ownerList.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </Select>

        {isCreateMode ? (
          <Select
            id="earning-description-select"
            label="Fonte de Ganho"
            value={selectedEarningId}
            onChange={(e) => handleEarningSelect(e.target.value)}
            disabled={!earningOwner}
            required
          >
            <option value="">
              {earningOwner ? 'Escolha o ganho' : 'Selecione um proprietário primeiro'}
            </option>
            {earningOptions.map((earning: Earning) => (
              <option key={earning.id} value={earning.id}>
                {earning.description}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            id="earning-description"
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isViewOnly}
            placeholder="Descrição do ganho"
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="earning-gross"
            label="Valor Bruto (R$)"
            value={grossPay}
            onChange={(e) => setGrossPay(e.target.value)}
            disabled={!recordEditable}
            placeholder="0,00"
            required
          />
          <Input
            id="earning-net"
            label="Valor Líquido (R$)"
            value={netPay}
            onChange={(e) => setNetPay(e.target.value)}
            disabled={!recordEditable}
            placeholder="0,00"
            required
          />
        </div>

        <Input
          id="earning-date"
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={!recordEditable}
          required
        />

        {!isCreateMode && (
          <Select
            id="earning-periodicity"
            label="Periodicidade"
            value={periodicity}
            onChange={(e) => setPeriodicity(e.target.value)}
            disabled={isViewOnly}
            required
          >
            {PERIODICITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            {isViewOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" loading={isSaving}>
              {isUpdate ? 'Salvar Alterações' : 'Salvar Registro'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalEarning;
