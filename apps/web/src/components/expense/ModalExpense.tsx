import React, { useState, useEffect } from 'react';
import { createExpense, getExpenseById, updateExpense } from '@/services/expense';
import { getPaymentTypes, PaymentType } from '@/services/paymentType';
import { getCreditCards, CreditCard } from '@/services/creditCard';
import { useToast } from '@/contexts/ToastContext';
import { extractErrorMessage } from '@cointrack/utils';
import { Alert, Button, Checkbox, Input, Modal, Select } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAction: () => void;
  isUpdate: boolean;
  expenseId: string;
}

const parseAmount = (value: string): number => {
  const parsed = parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

const ModalExpense: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCardAction,
  isUpdate,
  expenseId,
}) => {
  const toast = useToast();
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [estimatedAmount, setEstimatedAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [paid, setPaid] = useState<boolean>(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [creditCardId, setCreditCardId] = useState('');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isViewOnly = !isUpdate && expenseId !== '';

  const getTitle = () => {
    if (isUpdate) return 'Atualizar Despesa';
    if (isViewOnly) return 'Detalhes da Despesa';
    return 'Nova Despesa';
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isOpen) return;
      setError(null);

      try {
        const [paymentTypeResponse, creditCardResponse] = await Promise.all([
          getPaymentTypes(),
          getCreditCards(),
        ]);

        setPaymentTypes(
          Array.isArray(paymentTypeResponse?.message) ? paymentTypeResponse.message : []
        );
        setCards(
          Array.isArray(creditCardResponse?.message) ? creditCardResponse.message : []
        );

        if (expenseId && expenseId !== '') {
          const expenseResponse = await getExpenseById(expenseId);
          const expenseData = expenseResponse.message;

          setDescription(expenseData.description || '');
          setAmount(expenseData.amount?.toString() || '');
          setEstimatedAmount(expenseData.estimated_amount?.toString() || '');
          setFrequency(expenseData.frequency || '');
          setDueDate(expenseData.due_date ? expenseData.due_date.split('T')[0] : '');
          setPaymentDate(
            expenseData.payment_date ? expenseData.payment_date.split('T')[0] : ''
          );
          setSelectedPaymentType(expenseData.payment_type_id || '');
          setCreditCardId(expenseData.credit_card_id || '');
          setPaid(Boolean(expenseData.paid));
          setActive(Boolean(expenseData.active));
        } else {
          setDescription('');
          setAmount('');
          setEstimatedAmount('');
          setFrequency('');
          setDueDate('');
          setPaymentDate('');
          setSelectedPaymentType('');
          setCreditCardId('');
          setPaid(false);
          setActive(true);
        }
      } catch (err) {
        setError(extractErrorMessage(err, 'Falha ao carregar informações da despesa.'));
      }
    };

    loadInitialData();
  }, [isOpen, isUpdate, expenseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const amountFloat = parseAmount(amount);
      const estimatedAmountFloat = parseAmount(estimatedAmount);

      if (isUpdate) {
        await updateExpense(
          expenseId,
          description,
          frequency,
          amountFloat,
          estimatedAmountFloat,
          dueDate,
          paymentDate,
          selectedPaymentType,
          creditCardId,
          active,
          paid
        );
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await createExpense(
          description,
          frequency,
          amountFloat,
          estimatedAmountFloat,
          dueDate,
          paymentDate,
          selectedPaymentType,
          creditCardId,
          active,
          paid
        );
        toast.success('Despesa criada com sucesso!');
      }

      onCardAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar despesa.'));
    } finally {
      setIsSaving(false);
    }
  };

  const isCreditCardSelected = () => {
    const selected = paymentTypes.find((pt) => pt.id === selectedPaymentType);
    return selected?.name?.toLowerCase().includes('cartão de crédito') ?? false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Input
              id="expense-description"
              name="description"
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isViewOnly}
              placeholder="Ex: Energia, Aluguel"
              required
            />
          </div>
          <Input
            id="expense-estimated"
            name="estimated_amount"
            label="Valor Estimado (R$)"
            value={estimatedAmount}
            onChange={(e) => setEstimatedAmount(e.target.value)}
            disabled={isViewOnly}
            placeholder="0,00"
            required
          />
          <Input
            id="expense-amount"
            name="amount"
            label="Valor Pago (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isViewOnly}
            placeholder="0,00"
            required={isUpdate}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="expense-due-date"
            name="due_date"
            label="Data de Vencimento"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isViewOnly}
            required
          />
          <Input
            id="expense-payment-date"
            name="payment_date"
            label="Data do Pagamento"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            disabled={!paid || isViewOnly}
            required={paid}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="expense-payment-type"
            name="payment_type"
            label="Tipo de Pagamento"
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            disabled={isViewOnly}
            required
          >
            <option value="">Selecione</option>
            {paymentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            id="expense-card"
            name="credit_card"
            label="Cartão de Crédito"
            value={creditCardId}
            onChange={(e) => setCreditCardId(e.target.value)}
            disabled={!isCreditCardSelected() || isViewOnly}
          >
            <option value="">Selecione um cartão</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.owner} — •••• {c.final_card_num}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Select
            id="expense-frequency"
            name="frequency"
            label="Frequência"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            disabled={isViewOnly}
          >
            <option value="spot">Única</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </Select>

          <div className="flex items-center gap-6 h-[42px]">
            <Checkbox
              id="expense-active"
              label="Ativa"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isViewOnly}
            />
            <Checkbox
              id="expense-paid"
              label="Paga"
              checked={paid}
              onChange={(e) => {
                setPaid(e.target.checked);
                if (!e.target.checked) setPaymentDate('');
              }}
              disabled={isViewOnly}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            {isViewOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" loading={isSaving}>
              {isUpdate ? 'Salvar Alterações' : 'Salvar Despesa'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalExpense;
