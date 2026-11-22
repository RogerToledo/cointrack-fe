import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Checkbox, Modal } from '@/components/ui';

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepHistory: boolean) => void;
  title?: string;
  message: string;
  isLoading?: boolean;
}

const ModalConfirmDelete: React.FC<ModalConfirmDeleteProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  message,
  isLoading = false,
}) => {
  const [keepHistory, setKeepHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeepHistory(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(keepHistory)}
            loading={isLoading}
          >
            Excluir
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-danger-light flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted leading-relaxed pt-1">{message}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-background border border-border">
          <Checkbox
            id="keep-history"
            label="Manter histórico"
            checked={keepHistory}
            onChange={(e) => setKeepHistory(e.target.checked)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted mt-1.5 pl-6">
            Os lançamentos dos meses anteriores permanecem; apenas o registro atual é removido.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmDelete;
