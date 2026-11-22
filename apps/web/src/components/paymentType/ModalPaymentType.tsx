import React, { useEffect, useState } from 'react';
import {
  createPaymentType,
  updatePaymentType,
  getPaymentType,
} from '@/services/paymentType';
import { extractErrorMessage } from '@cointrack/utils';
import { useToast } from '@/contexts/ToastContext';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentTypeAction: () => void;
  isUpdate: boolean;
  paymentTypeId: string;
}

const ModalPaymentType: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onPaymentTypeAction,
  isUpdate,
  paymentTypeId,
}) => {
  const toast = useToast();
  const [paymentTypeName, setPaymentTypeName] = useState('');
  const [paymentTypeSpotInstallment, setPaymentTypeSpotInstallment] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (isUpdate && paymentTypeId) {
      const fetchPaymentType = async () => {
        try {
          const dataFromApi = await getPaymentType(paymentTypeId);
          const paymentTypeData = dataFromApi.message;
          if (paymentTypeData) {
            setPaymentTypeName(paymentTypeData.name);
            setPaymentTypeSpotInstallment(paymentTypeData.spot_payment);
          }
        } catch (err) {
          setError(extractErrorMessage(err, 'Erro ao carregar tipo de pagamento.'));
        }
      };
      fetchPaymentType();
    } else {
      setPaymentTypeName('');
      setPaymentTypeSpotInstallment(0);
    }
  }, [isUpdate, paymentTypeId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (isUpdate) {
        await updatePaymentType(
          paymentTypeId,
          paymentTypeName,
          paymentTypeSpotInstallment
        );
        toast.success('Tipo de pagamento atualizado com sucesso!');
      } else {
        await createPaymentType(paymentTypeName, paymentTypeSpotInstallment);
        toast.success('Tipo de pagamento criado com sucesso!');
      }
      onPaymentTypeAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar tipo de pagamento.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Atualizar Tipo de Pagamento' : 'Novo Tipo de Pagamento'}
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
          id="paymentTypeName"
          label="Nome"
          value={paymentTypeName}
          onChange={(e) => setPaymentTypeName(e.target.value)}
          placeholder="Ex: Pix, Cartão de Crédito, Débito"
          required
        />

        <Select
          id="paymentTypeSpotinstallment"
          label="Modalidade"
          value={paymentTypeSpotInstallment}
          onChange={(e) => setPaymentTypeSpotInstallment(Number(e.target.value))}
          required
        >
          <option value={0}>À vista</option>
          <option value={1}>Parcelado</option>
          <option value={2}>Ambos</option>
        </Select>

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

export default ModalPaymentType;
