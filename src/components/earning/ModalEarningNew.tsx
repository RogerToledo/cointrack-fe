import { createEarningDefinition } from '@/services/earning';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Person } from '@/services/person';
import { extractErrorMessage, logApiError } from '@/utils/errorMessage';
import { useState, useEffect } from 'react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const PERIODICITIES = [
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'SEMESTRAL', label: 'Semestral' },
    { value: 'ANUAL', label: 'Anual' },
];

const ModalEarningNew: React.FC<ModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [earningOwner, setEarningOwner] = useState('');
    const [description, setDescription] = useState('');
    const [periodicity, setPeriodicity] = useState('MENSAL');
    const [ownerList, setOwnerList] = useState<Person[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { selectedFamily } = useFamily();

    useEffect(() => {
        if (!isOpen) return;

        setSuccess(null);
        setError(null);
        setDescription('');
        setPeriodicity('MENSAL');

        let owners: Person[] = [];
        if (selectedFamily?.members && selectedFamily.members.length > 0) {
            owners = selectedFamily.members.map(m => ({ id: m.person_id, name: m.person_name }));
        } else if (user) {
            owners = [{ id: user.id, name: user.name }];
        }
        setOwnerList(owners);

        if (owners.length === 1) {
            setEarningOwner(owners[0].id);
        } else {
            setEarningOwner('');
        }
    }, [isOpen, selectedFamily, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError("Por favor, preencha a descrição.");
            return;
        }

        if (!earningOwner) {
            setError("Por favor, selecione um proprietário válido.");
            return;
        }

        setIsLoading(true);
        try {
            await createEarningDefinition({
                description: description.trim(),
                idUser: earningOwner,
                periodicity,
            });

            setSuccess("Ganho cadastrado com sucesso!");
            setTimeout(() => {
                onCreated();
                onClose();
            }, 1500);
        } catch (err) {
            logApiError('createEarningDefinition', err);
            setError(extractErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={isLoading ? undefined : onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Cadastrar novo ganho
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        aria-label="Fechar"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {success && (
                        <div className="flex items-center p-3 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center p-3 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="NewOwner" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proprietário</label>
                        <select
                            name="NewOwner"
                            id="NewOwner"
                            value={earningOwner}
                            onChange={(e) => setEarningOwner(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                        >
                            <option value="">Escolha o proprietário do ganho</option>
                            {ownerList.map((owner) => (
                                <option key={owner.id} value={owner.id}>{owner.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="NewDescription" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                        <input
                            type="text"
                            name="NewDescription"
                            id="NewDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Descrição do ganho"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="NewPeriodicity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Periodicidade</label>
                        <select
                            name="NewPeriodicity"
                            id="NewPeriodicity"
                            value={periodicity}
                            onChange={(e) => setPeriodicity(e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                        >
                            {PERIODICITIES.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalEarningNew;