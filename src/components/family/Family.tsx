import React, { useState, useEffect, useRef } from 'react';
import { getPendingInvites, acceptInvite, rejectInvite, FamilyInvite } from '@/services/family';
import { ApiError } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import ModalFamily from './ModalFamily';
import ModalInviteMember from './ModalInviteMember';

export default function Family() {
    const { user } = useAuth();
    const { families, selectedFamily, refreshFamilies } = useFamily();
    const [pendingInvites, setPendingInvites] = useState<FamilyInvite[]>([]);
    const [isModalFamilyOpen, setIsModalFamilyOpen] = useState(false);
    const [isModalInviteOpen, setIsModalInviteOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const isLoadingRef = useRef(false);

    const loadFamilyData = async (force = false) => {
        if (!user?.id) return;
        
        if (force) {
            isLoadingRef.current = false;
        }
        
        // Prevenir múltiplas chamadas simultâneas
        if (isLoadingRef.current) return;
        
        isLoadingRef.current = true;
        setIsLoading(true);
        setError('');

        try {
            const invitesResponse = await getPendingInvites();
            setPendingInvites(invitesResponse.message || []);
        } catch (err) {
            const error = err as ApiError;
            if (error.response?.status !== 404) {
                setError(error.response?.data?.message || 'Erro ao carregar convites.');
            }
            setPendingInvites([]);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    };

    useEffect(() => {
        loadFamilyData();
        
        return () => {
            isLoadingRef.current = false;
        };
    }, [user?.id]);

    const handleAcceptInvite = async (inviteId: string) => {
        try {
            await acceptInvite(inviteId);
            setSuccess('Convite aceito com sucesso!');
            await refreshFamilies(); // Atualizar lista de famílias
            loadFamilyData(true); // Forçar reload
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Erro ao aceitar convite.');
        }
    };

    const handleRejectInvite = async (inviteId: string) => {
        try {
            await rejectInvite(inviteId);
            setSuccess('Convite rejeitado.');
            loadFamilyData(true); // Forçar reload
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Erro ao rejeitar convite.');
        }
    };

    const handleFamilyCreated = async () => {
        await refreshFamilies();
        loadFamilyData(true); // Forçar reload
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                    {success}
                </div>
            )}

            {/* Convites Pendentes */}
            {pendingInvites && pendingInvites.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                        Convites Pendentes
                    </h3>
                    <div className="space-y-2">
                        {pendingInvites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Convite para: {invite.person_name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Família: {invite.family_name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(invite.invited_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptInvite(invite.id)}
                                        className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2"
                                    >
                                        Aceitar
                                    </button>
                                    <button
                                        onClick={() => handleRejectInvite(invite.id)}
                                        className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Informações da Família */}
            {!selectedFamily ? (
                <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                        Você ainda não tem uma família
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Crie uma família para compartilhar dados financeiros com outras pessoas.
                    </p>
                    <button
                        onClick={() => setIsModalFamilyOpen(true)}
                        className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Criar Família
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedFamily.name}
                        </h2>
                        <button
                            onClick={() => setIsModalInviteOpen(true)}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Convidar Membro
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                            Membros ({selectedFamily.members?.length || 0})
                        </h3>
                        <div className="space-y-2">
                            {selectedFamily.members && selectedFamily.members.length > 0 ? (
                                selectedFamily.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <span className="text-white font-medium">
                                                        {member.person_name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {member.person_name}
                                                    {member.role === 'owner' && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                                            Dono
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {member.person_email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                    Nenhum membro na família ainda.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ModalFamily
                isOpen={isModalFamilyOpen}
                onClose={() => setIsModalFamilyOpen(false)}
                onSuccess={handleFamilyCreated}
            />

            {selectedFamily && (
                <ModalInviteMember
                    isOpen={isModalInviteOpen}
                    onClose={() => setIsModalInviteOpen(false)}
                    onSuccess={loadFamilyData}
                    familyId={selectedFamily.id}
                />
            )}
        </div>
    );
}
