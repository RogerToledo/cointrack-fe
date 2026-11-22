import { useState, useEffect, useCallback } from 'react';
import { getPurchase, createPurchase, updatePurchase } from '@/services/purchase';
import { getCreditCards } from '@/services/creditCard';
import { getPaymentTypes } from '@/services/paymentType';
import { getPurchaseTypes } from '@/services/purchaseType';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { extractErrorMessage } from '@cointrack/utils';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

type UUID = string;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseAction: () => void;
  isUpdate: boolean;
  purchaseId: UUID | null;
}

interface PersonOption {
  id: string;
  name: string;
}

interface PaymentTypeOption {
  id: string;
  name: string;
  spot_payment: number;
}

interface CardOption {
  id: string;
  owner: string;
  final_card_num: string;
}

interface PurchaseTypeOption {
  id: string;
  name: string;
}

const initialFormState = {
  description: '',
  amount: '',
  date: '',
  installment_number: 0,
  place: '',
  paid: false,
  payment_type: '',
  credit_card: '',
  purchase_type: '',
  person: '',
};

const ModalPurchase: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onPurchaseAction,
  isUpdate,
  purchaseId,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeOption[]>([]);
  const [types, setTypes] = useState<PurchaseTypeOption[]>([]);
  const [cards, setCards] = useState<CardOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFamily, isLoading: isFamilyLoading } = useFamily();
  const { user } = useAuth();

  const isViewOnly = !isUpdate && purchaseId !== null;

  const getTitle = () => {
    if (isUpdate) return 'Atualizar Compra';
    if (isViewOnly) return 'Detalhes da Compra';
    return 'Nova Compra';
  };

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (purchaseId && (isUpdate || isViewOnly)) {
      const fetchPurchase = async () => {
        try {
          const response = await getPurchase(purchaseId);
          const data = response.message;
          setFormData({
            description: data.description || '',
            amount: data.amount?.toString() || '',
            date: data.date ? data.date.split('T')[0] : '',
            installment_number: data.installment_number || 0,
            place: data.place || '',
            paid: data.paid || false,
            payment_type: data.payment_type_id || '',
            credit_card: data.credit_card_id || '',
            purchase_type: data.purchase_type_id || '',
            person: data.person_id || '',
          });
        } catch (err) {
          setError(extractErrorMessage(err, 'Erro ao carregar dados da compra.'));
        }
      };
      fetchPurchase();
    } else {
      setFormData(initialFormState);
    }
  }, [isOpen, isUpdate, purchaseId, isViewOnly]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [paymentTypesData, cardsData, purchaseTypesData] = await Promise.all([
        getPaymentTypes(),
        getCreditCards(),
        getPurchaseTypes(),
      ]);

      if (!isFamilyLoading) {
        if (selectedFamily?.members && selectedFamily.members.length > 0) {
          const familyPersons = selectedFamily.members.map((member) => ({
            id: member.person_id,
            name: member.person_name,
          }));
          setPersons(familyPersons);
        } else if (user) {
          setPersons([{ id: user.id, name: user.name }]);
          if (!purchaseId) {
            setFormData((prev) => ({ ...prev, person: user.id }));
          }
        }
      }

      setPaymentTypes(Array.isArray(paymentTypesData.message) ? paymentTypesData.message : []);
      setCards(Array.isArray(cardsData.message) ? cardsData.message : []);
      setTypes(Array.isArray(purchaseTypesData.message) ? purchaseTypesData.message : []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao carregar metadados do formulário.'));
    }
  }, [selectedFamily, isFamilyLoading, user, purchaseId]);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen, fetchMetadata]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: name === 'installment_number' ? Number(value) : value,
      };

      if (name === 'payment_type') {
        const selected = paymentTypes.find((pt) => pt.id === value);
        const isCard = selected?.name.toLowerCase().includes('cartão de crédito');
        const isFinancing = selected?.name.toLowerCase().includes('financiamento');

        if (!isCard) {
          newData.credit_card = '';
        }

        if (selected?.spot_payment === 0 && !isFinancing) {
          newData.installment_number = 0;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const amountFloat =
        typeof formData.amount === 'string'
          ? parseFloat(formData.amount.replace(',', '.'))
          : formData.amount;

      if (isUpdate && purchaseId) {
        await updatePurchase(
          purchaseId,
          formData.description,
          amountFloat,
          formData.date,
          formData.installment_number,
          formData.place,
          formData.paid,
          formData.payment_type,
          formData.credit_card,
          formData.purchase_type,
          formData.person
        );
        toast.success('Compra atualizada com sucesso!');
      } else {
        const paidCorrected = formData.credit_card !== '';
        await createPurchase(
          formData.description,
          amountFloat,
          formData.date,
          formData.installment_number,
          formData.place,
          paidCorrected,
          formData.payment_type,
          formData.credit_card,
          formData.purchase_type,
          formData.person
        );
        toast.success('Compra cadastrada com sucesso!');
      }

      onPurchaseAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar compra.'));
    } finally {
      setIsSaving(false);
    }
  };

  const isCreditCardSelected = () => {
    const selectedType = (paymentTypes ?? []).find((pt) => pt.id === formData.payment_type);
    return selectedType?.name?.toLowerCase().includes('cartão de crédito') ?? false;
  };

  const isSpotPaymentSelected = () => {
    const selectedType = (paymentTypes ?? []).find((pt) => pt.id === formData.payment_type);
    const isFinancing = selectedType?.name?.toLowerCase().includes('financiamento');
    if (isFinancing) return false;
    return selectedType?.spot_payment === 0;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="purchase-place"
            name="place"
            label="Local"
            value={formData.place}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder="Ex: Supermercado, Loja..."
          />
          <Input
            id="purchase-description"
            name="description"
            label="Descrição"
            value={formData.description}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder="O que foi comprado"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="purchase-date"
            name="date"
            label="Data"
            type="date"
            value={formData.date}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          />
          <Input
            id="purchase-amount"
            name="amount"
            label="Valor (R$)"
            type="text"
            value={formData.amount}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder="0,00"
            required
          />
          <Input
            id="purchase-installments"
            name="installment_number"
            label="Parcelas"
            type="number"
            min={0}
            value={formData.installment_number}
            onChange={handleChange}
            disabled={isViewOnly || isSpotPaymentSelected()}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="purchase-person"
            name="person"
            label="Pessoa"
            value={formData.person}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          >
            <option value="">Escolha a pessoa</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            id="purchase-type"
            name="purchase_type"
            label="Tipo de Compra"
            value={formData.purchase_type}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          >
            <option value="">Selecione a categoria</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>

          <Select
            id="purchase-payment-type"
            name="payment_type"
            label="Tipo de Pagamento"
            value={formData.payment_type}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          >
            <option value="">Selecione a forma</option>
            {paymentTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </Select>

          <Select
            id="purchase-card"
            name="credit_card"
            label="Cartão de Crédito"
            value={formData.credit_card}
            onChange={handleChange}
            disabled={!isCreditCardSelected() || isViewOnly}
          >
            <option value="">Nenhum</option>
            {Array.isArray(cards) &&
              cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.owner} — •••• {c.final_card_num}
                </option>
              ))}
          </Select>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            {isViewOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" loading={isSaving}>
              {isUpdate ? 'Salvar Alterações' : 'Salvar Compra'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalPurchase;
