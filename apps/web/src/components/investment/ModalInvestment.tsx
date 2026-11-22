import React, { useState, useEffect, useCallback } from 'react';
import {
  getInvestment,
  createInvestment,
  updateInvestment,
} from '@/services/investment';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { extractErrorMessage } from '@cointrack/utils';
import { Alert, Button, Input, Modal, Select } from '@/components/ui';

type UUID = string;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvestmentAction: () => void;
  isUpdate: boolean;
  investmentId: UUID | null;
}

interface PersonOption {
  id: string;
  name: string;
}

const initialFormState = {
  description: '',
  monthly_amount: '',
  installments: 1,
  start_date: '',
  person: '',
};

const ModalInvestment: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onInvestmentAction,
  isUpdate,
  investmentId,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedFamily, isLoading: isFamilyLoading } = useFamily();
  const { user } = useAuth();

  const isViewOnly = !isUpdate && investmentId !== null;

  const getTitle = () => {
    if (isUpdate) return 'Atualizar Investimento';
    if (isViewOnly) return 'Detalhes do Investimento';
    return 'Novo Investimento';
  };

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (investmentId && (isUpdate || isViewOnly)) {
      const fetchInvestment = async () => {
        try {
          const response = await getInvestment(investmentId);
          const data = response.message;
          setFormData({
            description: data.description || '',
            monthly_amount: data.monthly_amount?.toString() || '',
            installments: data.installments || 1,
            start_date: data.start_date ? data.start_date.split('T')[0] : '',
            person: data.person_id || '',
          });
        } catch (err) {
          setError(extractErrorMessage(err, 'Erro ao carregar investimento.'));
        }
      };
      fetchInvestment();
    } else {
      setFormData(initialFormState);
    }
  }, [isOpen, isUpdate, investmentId, isViewOnly]);

  const fetchMetadata = useCallback(() => {
    if (isFamilyLoading) return;

    if (selectedFamily?.members && selectedFamily.members.length > 0) {
      const familyPersons = selectedFamily.members.map((member) => ({
        id: member.person_id,
        name: member.person_name,
      }));
      setPersons(familyPersons);
    } else if (user) {
      setPersons([{ id: user.id, name: user.name }]);
      if (!investmentId) {
        setFormData((prev) => ({ ...prev, person: user.id }));
      }
    }
  }, [selectedFamily, isFamilyLoading, user, investmentId]);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen, fetchMetadata]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'installments' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const amountFloat =
        typeof formData.monthly_amount === 'string'
          ? parseFloat(formData.monthly_amount.replace(',', '.'))
          : formData.monthly_amount;

      if (isUpdate && investmentId) {
        await updateInvestment(
          investmentId,
          formData.description,
          amountFloat,
          formData.installments,
          formData.start_date,
          formData.person
        );
        toast.success('Investimento atualizado com sucesso!');
      } else {
        await createInvestment(
          formData.description,
          amountFloat,
          formData.installments,
          formData.start_date,
          formData.person
        );
        toast.success('Investimento cadastrado com sucesso!');
      }

      onInvestmentAction();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao salvar investimento.'));
    } finally {
      setIsSaving(false);
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
        <Input
          id="inv-description"
          name="description"
          label="Descrição"
          value={formData.description}
          onChange={handleChange}
          disabled={isViewOnly}
          placeholder="Ex: Tesouro Direto, CDB, Ações"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="inv-amount"
            name="monthly_amount"
            label="Valor Mensal (R$)"
            value={formData.monthly_amount}
            onChange={handleChange}
            disabled={isViewOnly}
            placeholder="0,00"
            required
          />
          <Input
            id="inv-installments"
            name="installments"
            label="Parcelas (Aportes)"
            type="number"
            min={1}
            value={formData.installments}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="inv-start-date"
            name="start_date"
            label="Data de Início"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isViewOnly}
            required
          />
          <Select
            id="inv-person"
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
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            {isViewOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" loading={isSaving}>
              {isUpdate ? 'Salvar Alterações' : 'Salvar Investimento'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalInvestment;
