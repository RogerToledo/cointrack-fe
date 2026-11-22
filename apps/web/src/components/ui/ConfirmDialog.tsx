import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

type ConfirmTone = 'danger' | 'primary' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
}

const toneIcon: Record<ConfirmTone, React.ReactNode> = {
  danger: (
    <div className="w-11 h-11 rounded-xl bg-danger-light flex items-center justify-center flex-shrink-0">
      <AlertTriangle className="w-5 h-5 text-danger" />
    </div>
  ),
  primary: (
    <div className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
      <Info className="w-5 h-5 text-accent" />
    </div>
  ),
  success: (
    <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
      <CheckCircle2 className="w-5 h-5 text-success" />
    </div>
  ),
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        {toneIcon[tone]}
        <p className="text-sm text-muted leading-relaxed pt-1">{description}</p>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
