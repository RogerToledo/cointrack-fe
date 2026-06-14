import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserFamilies, getFamilyMembers, Family } from '@/services/family';
import { ApiError } from '@/types/api';

interface FamilyContextType {
    families: Family[];
    selectedFamily: Family | null;
    isLoading: boolean;
    setSelectedFamily: (family: Family) => void;
    refreshFamilies: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamilyState] = useState<Family | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadFamilies = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Tentar buscar todas as famílias (endpoint pode retornar array ou objeto único)
            const response = await getUserFamilies();
            let userFamilies: Family[] = [];

            // Se a resposta for um array, usar diretamente
            if (Array.isArray(response.message)) {
                userFamilies = response.message;
            } else if (response.message) {
                // Se for um objeto único, converter para array
                userFamilies = [response.message];
            }

            // Buscar membros para cada família
            const familiesWithMembers = await Promise.all(
                userFamilies.map(async (family) => {
                    try {
                        const membersResponse = await getFamilyMembers(family.id);
                        return {
                            ...family,
                            members: membersResponse.message || []
                        };
                    } catch (err) {
                        console.error(`Erro ao carregar membros da família ${family.id}:`, err);
                        return {
                            ...family,
                            members: []
                        };
                    }
                })
            );

            setFamilies(familiesWithMembers);

            // Se houver famílias, selecionar automaticamente
            if (familiesWithMembers.length > 0) {
                // Tentar recuperar a família selecionada do localStorage
                const savedFamilyId = localStorage.getItem('selectedFamilyId');
                const savedFamily = familiesWithMembers.find(f => f.id === savedFamilyId);

                if (savedFamily) {
                    setSelectedFamilyState(savedFamily);
                } else {
                    // Se não houver família salva ou não for encontrada, selecionar a primeira
                    setSelectedFamilyState(familiesWithMembers[0]);
                    localStorage.setItem('selectedFamilyId', familiesWithMembers[0].id);
                }
            } else {
                setSelectedFamilyState(null);
                localStorage.removeItem('selectedFamilyId');
            }
        } catch (err) {
            const error = err as ApiError;
            console.error('Erro ao carregar famílias:', error);
            setFamilies([]);
            setSelectedFamilyState(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFamilies();
    }, [user?.id]);

    const setSelectedFamily = (family: Family) => {
        setSelectedFamilyState(family);
        localStorage.setItem('selectedFamilyId', family.id);
    };

    const refreshFamilies = async () => {
        await loadFamilies();
    };

    const value = {
        families,
        selectedFamily,
        isLoading,
        setSelectedFamily,
        refreshFamilies,
    };

    return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily deve ser usado dentro de um FamilyProvider');
    }
    return context;
};
