import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { extractErrorMessage } from '../utils/errorMessage';

interface ProfileData {
    id: string;
    name: string;
    email: string;
}

interface UseProfileReturn {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;
    updating: boolean;
    updatingPassword: boolean;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: { name: string; email: string }) => Promise<boolean>;
    updatePassword: (currentPassword: string, newPassword: string, confirmation: string) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.getProfile();
            setProfile(response);
        } catch (err) {
            setError(extractErrorMessage(err, 'Erro ao carregar perfil'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = useCallback(async (data: { name: string; email: string }): Promise<boolean> => {
        setUpdating(true);
        try {
            const response = await authService.updateProfile(data);
            setProfile(response);
            return true;
        } catch (err) {
            throw err;
        } finally {
            setUpdating(false);
        }
    }, []);

    const updatePassword = useCallback(async (currentPassword: string, newPassword: string, _confirmation: string): Promise<boolean> => {
        setUpdatingPassword(true);
        try {
            await authService.updatePassword(currentPassword, newPassword);
            return true;
        } catch (err) {
            throw err;
        } finally {
            setUpdatingPassword(false);
        }
    }, []);

    return {
        profile,
        loading,
        error,
        updating,
        updatingPassword,
        fetchProfile,
        updateProfile,
        updatePassword,
    };
}
