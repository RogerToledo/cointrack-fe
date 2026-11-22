import React, { useState, useEffect } from 'react';
import { extractErrorMessage } from '@cointrack/utils';
import { CheckCircle2 } from 'lucide-react';
import { Alert, Button, Input, Modal } from '@/components/ui';

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, amount: number, date: string) => Promise<void> | void;
  expenseId: string;
}

const ModalPayExpense: React.FC<PayModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  expenseId,
}) => {
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPayAmount('');
      setPayDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountFloat = parseFloat(String(payAmount).replace(',', '.'));
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    setIsPaying(true);
    try {
      await onConfirm(expenseId, amountFloat, payDate);
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao processar pagamento.'));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pagamento"
      subtitle="Informe a data e o valor efetivamente pago"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="pay-date"
            label="Data do Pagamento"
            type="date"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            required
          />
          <Input
            id="pay-amount"
            label="Valor Pago (R$)"
            type="text"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isPaying}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="success"
            loading={isPaying}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirmar Pagamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalPayExpense;
