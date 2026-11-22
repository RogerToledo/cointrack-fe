import React, { useState, useEffect } from 'react';
import {
  createCreditCard,
  getCreditCard,
  getPhysicalCreditCards,
  updateCreditCard,
  CreditCard,
} from '@/services/creditCard';
import { Person } from '@/services/person';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { extractErrorMessage } from '@cointrack/utils';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAction: () => void;
  isUpdate: boolean;
  creditCardId: string;
}

const ModalCreditCard: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCardAction,
  isUpdate,
  creditCardId,
}) => {
  const toast = useToast();
  const [cardOwner, setCardOwner] = useState('');
  const [finalCardNum, setFinalCardNum] = useState('');
  const [type, setType] = useState('');
  const [invoiceCloseDay, setInvoiceCloseDay] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [cardName, setCardName] = useState('');
  const [parentCardId, setParentCardId] = useState('');
  const [physicalCards, setPhysicalCards] = useState<CreditCard[]>([]);
  const [ownerList, setOwnerList] = useState<Person[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFamily } = useFamily();
  const { user } = useAuth();

  const isVirtualType = type === 'V' || type === 'VT';
  const showCardName = type === 'V';
  const showParentCard = type === 'V' || type === 'VT';

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

        try {
          const cardsResponse = await getPhysicalCreditCards();
          setPhysicalCards(
            Array.isArray(cardsResponse?.message) ? cardsResponse.message : []
          );
        } catch {
          setPhysicalCards([]);
        }

        if (isUpdate && creditCardId) {
          const cardResponse = await getCreditCard(creditCardId);
          const cardData = cardResponse.message;
          setCardOwner(cardData.owner_id);
          setFinalCardNum(cardData.final_card_num);
          setType(cardData.type);
          setInvoiceCloseDay(String(cardData.invoice_closing_day || ''));
          setDueDate(String(cardData.due_date || ''));
          setCardName(cardData.card_name || '');
          setParentCardId(cardData.physical_card_id || '');
        } else {
          setCardOwner(owners.length === 1 ? owners[0].id : '');
          setFinalCardNum('');
          setType('');
          setInvoiceCloseDay('');
          setDueDate('');
          setCardName('');
          setParentCardId('');
        }
      } catch (err) {
        setError(extractErrorMessage(err, 'Falha ao carregar informações do servidor.'));
      }
    };

    loadInitialData();
  }, [isOpen, isUpdate, creditCardId, selectedFamily?.members, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cardOwner || cardOwner === '00000000-0000-0000-0000-000000000000') {
      setError('Por favor, selecione um proprietário válido.');
      return;
    }
    if (isVirtualType && !parentCardId) {
      setError('Por favor, selecione o cartão físico vinculado.');
      return;
    }

    let resolvedCardName: string | undefined;
    if (type === 'F') resolvedCardName = 'Físico';
    else if (type === 'VT') resolvedCardName = 'Temporário';
    else if (type === 'V') resolvedCardName = cardName || undefined;

    setIsSaving(true);
    try {
      if (isUpdate) {
        await updateCreditCard(
          creditCardId,
          cardOwner,
          finalCardNum,
          type,
          Number(invoiceCloseDay),
          Number(dueDate),
          resolvedCardName,
          showParentCard ? parentCardId : undefined
        );
        toast.success('Cartão de crédito atualizado com sucesso!');
      } else {
        await createCreditCard(
          cardOwner,
          finalCardNum,
          type,
          Number(invoiceCloseDay),
          Number(dueDate),
          resolvedCardName,
          showParentCard ? parentCardId : undefined
        );
        toast.success('Cartão de crédito criado com sucesso!');
      }

      onCardAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar cartão de crédito.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Atualizar Cartão de Crédito' : 'Novo Cartão de Crédito'}
      size="md"
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
        <Select
          id="card-owner"
          label="Proprietário"
          value={cardOwner}
          onChange={(e) => setCardOwner(e.target.value)}
          required
        >
          <option value="">Escolha o proprietário do cartão</option>
          {ownerList.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="card-final"
            label="Final do Cartão"
            value={finalCardNum}
            onChange={(e) => setFinalCardNum(e.target.value)}
            placeholder="0000"
            maxLength={4}
            required
          />

          <Select
            id="card-type"
            label="Tipo do Cartão"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            <option value="F">Físico</option>
            <option value="V">Virtual</option>
            <option value="VT">Virtual Temporário</option>
          </Select>
        </div>

        {showCardName && (
          <Input
            id="card-name"
            label="Nome do Cartão"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Ex: Compras online"
          />
        )}

        {showParentCard && (
          <Select
            id="card-parent"
            label="Cartão Físico (pai)"
            value={parentCardId}
            onChange={(e) => setParentCardId(e.target.value)}
            hint="Vincule ao cartão físico correspondente para agrupamento de fatura."
            required
          >
            <option value="">Selecione o cartão físico vinculado</option>
            {physicalCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.owner} — •••• {card.final_card_num}
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="card-closing-day"
            label="Dia de Fechamento"
            type="number"
            min={1}
            max={31}
            value={invoiceCloseDay}
            onChange={(e) => setInvoiceCloseDay(e.target.value)}
            placeholder="15"
            required
          />
          <Input
            id="card-due-day"
            label="Dia de Vencimento"
            type="number"
            min={1}
            max={31}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="25"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving}>
            {isUpdate ? 'Salvar Alterações' : 'Salvar Cartão'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCreditCard;
