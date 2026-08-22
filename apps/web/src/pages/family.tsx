import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Family from '@/components/family/Family';
import { useFamily } from '@/contexts/FamilyContext';

export default function FamilyPage() {
    const { families } = useFamily();

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Minha Família
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Gerencie sua família e compartilhe dados financeiros com outros membros.
                    </p>
                    {families.length > 1 && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                💡 Você pertence a <strong>{families.length} famílias</strong>. Use o seletor na barra de navegação para alternar entre elas.
                            </p>
                        </div>
                    )}
                </div>
                <Family />
            </div>
        </ProtectedRoute>
    );
}
