import { createEarningRecord, getEarningBy, getEarnings, updateEarning, Earning } from '@/services/earning';
import { Person } from '@/services/person';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { extractErrorMessage, logApiError } from '@/utils/errorMessage';
import { useState, useEffect } from 'react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAction: () => void;
    isUpdate: boolean;
    earningId: string;
}

const INVALID_OWNER = "00000000-0000-0000-0000-000000000000";

function toNumber(value: string): number {
    return parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
}

const ModalEarning: React.FC<ModalProps> = ({ isOpen, onClose, onCardAction, isUpdate, earningId}) => {
    const [buttonText, setButtonText] = useState("Adicionar novo registro");
    const [earningOwner, setEarningOwner] = useState('');
    const [description, setDescription] = useState('');
    const [grossPay, setGrossPay] = useState('');
    const [netPay, setNetPay] = useState('');
    const [date, setDate] = useState('');
    const [periodicity, setPeriodicity] = useState('MENSAL');
    const [ownerList, setOwnerList] = useState<Person[]>([]);
    const [earningOptions, setEarningOptions] = useState<Earning[]>([]);
    const [selectedEarningId, setSelectedEarningId] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { selectedFamily } = useFamily();
    const { user } = useAuth();

    const isViewOnly = !isUpdate && earningId !== "";
    const isCreateMode = !isUpdate && !isViewOnly;

    // O PUT /v1/earnings so atualiza a definicao do ganho. Bruto, liquido e data
    // pertencem ao lancamento mensal, entao ficam somente leitura ate existir
    // edicao de registro. No cadastro eles liberam depois que a descricao e escolhida.
    const recordEditable = isCreateMode && selectedEarningId !== '';

    const getTitle = () => {
        if (isUpdate) return "Atualizar Ganho";
        if (isViewOnly) return "Visualizar Ganho";
        return "Novo Registro";
    }

    const loadDescriptions = async (ownerId: string) => {
        if (!ownerId || ownerId === INVALID_OWNER) {
            setEarningOptions([]);
            return;
        }

        try {
            const allEarnings = await getEarnings(undefined, undefined, ownerId);

            // O idUser ja vai na query, mas o filtro tambem e aplicado aqui para
            // garantir que só entrem descrições do proprietário escolhido, mesmo
            // se o back devolver registros de outras pessoas.
            const owned = Array.isArray(allEarnings?.message)
                ? allEarnings.message.filter((earning: Earning) => earning.idUser === ownerId)
                : [];

            setEarningOptions(owned);
        } catch (earningError) {
            logApiError('getEarnings (earning modal)', earningError);
            setEarningOptions([]);
        }
    }

    useEffect(() => {
        const loadInitialData = async () => {
            setSuccess(null);
            setError(null);

            if (isOpen) {
                try {
                    // Usar membros da família ou apenas o usuário logado
                    let owners: Person[] = [];
                    if (selectedFamily?.members && selectedFamily.members.length > 0) {
                        owners = selectedFamily.members.map(m => ({ id: m.person_id, name: m.person_name }));
                    } else if (user) {
                        owners = [{ id: user.id, name: user.name }];
                    }
                    setOwnerList(owners);

                    if (earningId && earningId !== "" && (isUpdate || isViewOnly)) {
                        setButtonText("Atualizar Ganho");

                        const earningResponse = await getEarningBy(earningId);
                        const earningData = earningResponse.message;

                        const ownerId = earningData.idUser || INVALID_OWNER;
                        const dateFormatted = earningData.record?.date ? earningData.record.date.split('T')[0] : '';

                        setEarningOwner(ownerId);
                        setDescription(earningData.description);
                        setGrossPay(earningData.record?.gross_pay?.toString() || '');
                        setNetPay(earningData.record?.net_pay?.toString() || '');
                        setDate(dateFormatted);
                        setPeriodicity(earningData.periodicity || 'MENSAL');
                    } else {
                        setButtonText("Adicionar novo registro");
                        setDescription('');
                        setGrossPay('');
                        setNetPay('');
                        setDate('');
                        setPeriodicity('MENSAL');
                        setSelectedEarningId('');
                        setEarningOptions([]);

                        // Conta sem familia tem um unico proprietario: ja seleciona
                        // e carrega as descricoes dele.
                        if (owners.length === 1) {
                            setEarningOwner(owners[0].id);
                            await loadDescriptions(owners[0].id);
                        } else {
                            setEarningOwner("");
                        }
                    }
                } catch (error) {
                    logApiError('loadInitialData (earning modal)', error);
                    setError(extractErrorMessage(error) || "Ocorreu um erro inesperado ao carregar os dados.");
                }
            }
        };
        loadInitialData();
    }, [isOpen, isUpdate, earningId, isViewOnly, selectedFamily?.members, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!earningOwner || earningOwner === INVALID_OWNER) {
            setError("Por favor, selecione um proprietário válido.");
            return;
        }

        try {
            if (isCreateMode) {
                if (!selectedEarningId) {
                    setError("Por favor, selecione um ganho.");
                    return;
                }

                if (!date) {
                    setError("Por favor, selecione uma data válida.");
                    return;
                }

                const grossPayNumber = toNumber(grossPay);
                const netPayNumber = toNumber(netPay);

                if (isNaN(grossPayNumber) || isNaN(netPayNumber)) {
                    setError("Por favor, preencha o bruto e o líquido com valores válidos.");
                    return;
                }

                // Lancamento mensal sobre um ganho ja cadastrado.
                await createEarningRecord({
                    id_earning: selectedEarningId,
                    date,
                    gross_pay: grossPayNumber,
                    net_pay: netPayNumber,
                });
                setSuccess("Registro criado com sucesso!");
            } else {
                // Mesmo corpo do POST /v1/earnings.
                await updateEarning(earningId, {
                    description,
                    id_user: earningOwner || user?.id || '',
                    periodicity,
                });
                setSuccess("Ganho atualizado com sucesso!");
            }

            setTimeout(() => {
                onCardAction();
                onClose();
            }, 3000);
        } catch (err) {
            logApiError(isUpdate ? 'updateEarning' : 'createEarningRecord', err);
            setError(extractErrorMessage(err));
        }
    }

    // Passo 2: o usuario escolhe o proprietario e as descricoes dele sao carregadas.
    const handleOwnerSelect = async (id: string) => {
        setEarningOwner(id);
        setSelectedEarningId('');
        setDescription('');
        setPeriodicity('MENSAL');
        setGrossPay('');
        setNetPay('');
        await loadDescriptions(id);
    }

    // Passo 4: a descricao define a periodicidade e libera bruto e liquido.
    const handleEarningSelect = (id: string) => {
        setSelectedEarningId(id);

        const found = earningOptions.find(e => e.id === id);
        if (found) {
            setDescription(found.description);
            setPeriodicity(found.periodicity || 'MENSAL');
        } else {
            setDescription('');
            setPeriodicity('MENSAL');
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        switch(name) {
            case 'Owner':
                setEarningOwner(value);
                break;
            case 'Description':
                setDescription(value);
                break;
            case 'GrossPay':
                setGrossPay(value);
                break;
            case 'NetPay':
                setNetPay(value);
                break;
            case 'Date':
                setDate(value);
                break;
            case 'Periodicity':
                setPeriodicity(value);
                break;
            default:
                break;
        }
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            {/* Main modal */}

                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/*Modal content */}
                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {getTitle()}
                            </h3>
                            <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/*  Modal body */}
                        <div className="p-4 md:p-5">
                            {/* Success alert */}
                            {success && (
                                <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <div className="ms-3 text-sm font-medium">
                                        {success}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSuccess(null)}
                                        className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                                    >
                                        <span className="sr-only">Fechar</span>
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {/* Error alert */}
                            {error && (
                                <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="sr-only">Erro</span>
                                    <div className="ms-3 text-sm font-medium">
                                        {error}
                                    </div>
                                    <button
                                        onClick={() => setError(null)}
                                        type="button"
                                        className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" 
                                        aria-label="Close"
                                    >
                                        <span className="sr-only">Fechar</span>
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4" action="#">
                                <div>
                                    <label htmlFor="Owner" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proprietário</label>
                                    <select
                                        name="Owner"
                                        id="Owner"
                                        value={earningOwner}
                                        onChange={(e) => isCreateMode ? handleOwnerSelect(e.target.value) : handleChange(e)}
                                        disabled={isViewOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o proprietário do ganho</option>
                                        {ownerList.map((owner) => (
                                            <option key={owner.id} value={owner.id}>{owner.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                    {isCreateMode ? (
                                        <select
                                            name="Description"
                                            id="Description"
                                            value={selectedEarningId}
                                            onChange={(e) => handleEarningSelect(e.target.value)}
                                            disabled={!earningOwner}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            required
                                        >
                                            <option value="">
                                                {earningOwner ? 'Escolha o ganho' : 'Selecione um proprietário primeiro'}
                                            </option>
                                            {earningOptions.map((earning: Earning) => (
                                                <option key={earning.id} value={earning.id}>{earning.description}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            name="Description"
                                            id="Description"
                                            value={description}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                            placeholder="Descrição do ganho"
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="GrossPay" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bruto</label>
                                    <input
                                        type="text"
                                        name="GrossPay"
                                        id="GrossPay"
                                        value={grossPay}
                                        onChange={handleChange}
                                        disabled={!recordEditable}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="NetPay" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Líquido</label>
                                    <input
                                        type="text"
                                        name="NetPay"
                                        id="NetPay"
                                        value={netPay}
                                        onChange={handleChange}
                                        disabled={!recordEditable}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="Date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                    <input
                                        type="date"
                                        name="Date"
                                        id="Date"
                                        value={date}
                                        onChange={handleChange}
                                        disabled={!recordEditable}
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                                {!isCreateMode && (
                                <div>
                                    <label htmlFor="Periodicity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Periodicidade</label>
                                    <select 
                                        name="Periodicity" 
                                        id="Periodicity"
                                        value={periodicity}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="MENSAL">Mensal</option>
                                        <option value="SEMESTRAL">Semestral</option>
                                        <option value="ANUAL">Anual</option>
                                    </select>
                                </div>
                                )}
                                {!isViewOnly && (
                                    <button
                                        type="submit"
                                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        {buttonText}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default ModalEarning;
