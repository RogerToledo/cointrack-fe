import { useState, useEffect } from 'react';
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

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
    isLoading = false
}) => {
    const [keepHistory, setKeepHistory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setKeepHistory(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={isLoading ? undefined : onClose}></div>
            <div className="relative bg-card rounded-xl shadow-lg max-w-md w-full mx-4 border border-border">
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-danger shrink-0" aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-4">
                    <p className="text-sm text-muted">{message}</p>
                </div>

                <div className="px-6 pb-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={keepHistory}
                            onChange={(e) => setKeepHistory(e.target.checked)}
                            disabled={isLoading}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-foreground">
                            Manter histórico
                            <span className="block text-xs text-muted mt-1">
                                Os lançamentos dos meses anteriores permanecem, apenas o registro atual é removido.
                            </span>
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(keepHistory)}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-danger hover:bg-danger/90 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmDelete;
