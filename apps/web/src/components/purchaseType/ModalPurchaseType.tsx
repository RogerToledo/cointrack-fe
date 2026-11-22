import React, { useEffect, useState } from 'react';
import {
  createPurchaseType,
  updatePurchaseType,
  getPurchaseType,
} from '@/services/purchaseType';
import { extractErrorMessage } from '@cointrack/utils';
import { useToast } from '@/contexts/ToastContext';
import { Alert, Button, Input, Modal } from '@/components/ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseTypeAction: () => void;
  isUpdate: boolean;
  purchaseTypeId: string;
}

const ModalPurchaseType: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onPurchaseTypeAction,
  isUpdate,
  purchaseTypeId,
}) => {
  const toast = useToast();
  const [purchaseTypeName, setPurchaseTypeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (isUpdate && purchaseTypeId) {
      const fetchPurchaseType = async () => {
        try {
          const response = await getPurchaseType(purchaseTypeId);
          setPurchaseTypeName(response.message.name);
        } catch (err) {
          setError(extractErrorMessage(err, 'Erro ao carregar tipo de compra.'));
        }
      };
      fetchPurchaseType();
    } else {
      setPurchaseTypeName('');
    }
  }, [isUpdate, purchaseTypeId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (isUpdate) {
        await updatePurchaseType(purchaseTypeId, purchaseTypeName);
        toast.success('Tipo de compra atualizado com sucesso!');
      } else {
        await createPurchaseType(purchaseTypeName);
        toast.success('Tipo de compra cadastrado com sucesso!');
      }

      onPurchaseTypeAction();
      setPurchaseTypeName('');
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar tipo de compra.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? 'Atualizar Tipo de Compra' : 'Novo Tipo de Compra'}
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
          id="purchaseTypeName"
          label="Nome"
          value={purchaseTypeName}
          onChange={(e) => setPurchaseTypeName(e.target.value)}
          placeholder="Ex: Alimentação, Saúde, Lazer"
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

export default ModalPurchaseType;
