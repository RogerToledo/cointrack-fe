import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiClient } from '../services/api';

interface FamilyMember {
    id: string;
    family_id: string;
    person_id: string;
    role: string;
    status: string;
    invited_at: string;
    joined_at?: string;
    person_name: string;
    person_email: string;
    family_name: string;
}

interface Family {
    id: string;
    name: string;
    created_by: string;
    members?: FamilyMember[];
}

interface FamilyContextType {
    families: Family[];
    selectedFamily: Family | null;
    isLoading: boolean;
    setSelectedFamily: (family: Family) => Promise<void>;
    refreshFamilies: () => Promise<void>;
}

const SELECTED_FAMILY_KEY = 'selectedFamilyId';

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const toast = useToast();
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamily, setSelectedFamilyState] = useState<Family | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadFamilies = useCallback(async () => {
        if (!isAuthenticated) {
            setFamilies([]);
            setSelectedFamilyState(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.get<{
                message: {
                    user: { id: string; name: string; email: string };
                    families: Array<{
                        id: string;
                        name: string;
                        created_by: string;
                        role: string;
                        members?: FamilyMember[];
                    }>;
                };
                statusCode: number;
            }>('/v1/me');

            const meData = response.data?.message;

            if (!meData || !Array.isArray(meData.families) || meData.families.length === 0) {
                setFamilies([]);
                setSelectedFamilyState(null);
                await SecureStore.deleteItemAsync(SELECTED_FAMILY_KEY);
                return;
            }

            const userFamilies: Family[] = meData.families.map(f => ({
                id: f.id,
                name: f.name,
                created_by: f.created_by,
                members: f.members || [],
            }));

            setFamilies(userFamilies);

            // Restore persisted selection or default to first family
            const savedFamilyId = await SecureStore.getItemAsync(SELECTED_FAMILY_KEY);
            const savedFamily = userFamilies.find(f => f.id === savedFamilyId);

            if (savedFamily) {
                setSelectedFamilyState(savedFamily);
            } else {
                setSelectedFamilyState(userFamilies[0]);
                await SecureStore.setItemAsync(SELECTED_FAMILY_KEY, userFamilies[0].id);
            }
        } catch (err) {
            // On error, retain whatever state we have to avoid breaking navigation
            console.error('Erro ao carregar famílias:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadFamilies();
    }, [loadFamilies]);

    const setSelectedFamily = useCallback(async (family: Family) => {
        const previousFamily = selectedFamily;
        try {
            setSelectedFamilyState(family);
            await SecureStore.setItemAsync(SELECTED_FAMILY_KEY, family.id);
        } catch (err) {
            // Revert to previous family on failure
            setSelectedFamilyState(previousFamily);
            toast.show('Erro ao trocar de família. Tente novamente.', 'error');
        }
    }, [selectedFamily, toast]);

    const refreshFamilies = useCallback(async () => {
        await loadFamilies();
    }, [loadFamilies]);

    const value: FamilyContextType = {
        families,
        selectedFamily,
        isLoading,
        setSelectedFamily,
        refreshFamilies,
    };

    return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily(): FamilyContextType {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
}
