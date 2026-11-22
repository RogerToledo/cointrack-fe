import React, { useState, useEffect } from 'react';
import { InvestmentInstallment } from '@/services/investment';
import { formatBRL, formatDateBR, extractErrorMessage } from '@cointrack/utils';
import { CheckCircle2 } from 'lucide-react';
import { Alert, Badge, Button, Modal } from '@/components/ui';

interface ModalInvestmentInstallmentsProps {
  isOpen: boolean;
  onClose: () => void;
  installments: InvestmentInstallment[];
  onPay: (installmentId: string) => Promise<void>;
}

const ModalInvestmentInstallments: React.FC<ModalInvestmentInstallmentsProps> = ({
  isOpen,
  onClose,
  installments,
  onPay,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPayingId(null);
    }
  }, [isOpen]);

  const handlePay = async (id: string) => {
    setError(null);
    setPayingId(id);
    try {
      await onPay(id);
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao processar o pagamento.'));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aportes do Investimento"
      subtitle={`${installments.length} aporte(s) programado(s)`}
      size="lg"
    >
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/80">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Aporte
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Vencimento
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Valor
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {installments.length > 0 ? (
              installments.map((inst) => (
                <tr key={inst.id} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    #{inst.number}
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">
                    {formatDateBR(inst.due_date)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">
                    {formatBRL(inst.value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={inst.paid ? 'success' : 'warning'} dot>
                      {inst.paid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!inst.paid && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={payingId === inst.id}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handlePay(inst.id)}
                      >
                        Pagar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhum aporte encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default ModalInvestmentInstallments;
