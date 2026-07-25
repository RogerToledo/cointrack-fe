import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Family, FamilyMember } from '@/services/family';
import { getPerson } from '@/services/person';

interface FamilyContextType {
    families: Family[];
    selectedFamily: Family | null;
    isLoading: boolean;
    setSelectedFamily: (family: Family) => void;
    refreshFamilies: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamilyState] = useState<Family | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadFamilies = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await getPerson();
            const meData = response?.message;

            if (!meData) {
                setFamilies([]);
                setSelectedFamilyState(null);
                localStorage.removeItem('selectedFamilyId');
                return;
            }

            // Atualizar os dados do usuário no contexto com os dados reais do banco
            if (meData.user) {
                updateUser({
                    id: meData.user.id,
                    name: meData.user.name,
                    email: meData.user.email
                });
            }

            // Extrair famílias do /v1/me response
            const rawFamilies = meData.families as Array<{
                id: string;
                name: string;
                created_by: string;
                role: string;
                members?: FamilyMember[];
            }>;

            let userFamilies: Family[] = [];

            if (Array.isArray(rawFamilies) && rawFamilies.length > 0) {
                userFamilies = rawFamilies.map(f => ({
                    id: f.id,
                    name: f.name,
                    created_by: f.created_by,
                    created_at: '',
                    members: f.members || []
                }));
            }

            setFamilies(userFamilies);

            // Se houver famílias, selecionar automaticamente
            if (userFamilies.length > 0) {
                const savedFamilyId = localStorage.getItem('selectedFamilyId');
                const savedFamily = userFamilies.find(f => f.id === savedFamilyId);

                if (savedFamily) {
                    setSelectedFamilyState(savedFamily);
                } else {
                    setSelectedFamilyState(userFamilies[0]);
                    localStorage.setItem('selectedFamilyId', userFamilies[0].id);
                }
            } else {
                setSelectedFamilyState(null);
                localStorage.removeItem('selectedFamilyId');
            }
        } catch (err) {
            console.error('Erro ao carregar famílias:', err);
            // Mantém os estados populados anteriores para não quebrar a navegação
            // em caso de oscilações ou falhas temporárias na API.
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, updateUser]);

    useEffect(() => {
        loadFamilies();
    }, [loadFamilies]);

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
