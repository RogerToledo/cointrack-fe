import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Family from '@/components/family/Family';
import { useFamily } from '@/contexts/FamilyContext';
import { Alert, PageHeader } from '@/components/ui';

export default function FamilyPage() {
  const { families } = useFamily();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <PageHeader
          title="Minha Família"
          subtitle="Gerencie seu grupo familiar e compartilhe dados financeiros com segurança"
        />

        {families.length > 1 && (
          <Alert
            variant="info"
            message={`Você pertence a ${families.length} famílias. Use o seletor na barra lateral para alternar entre elas.`}
          />
        )}

        <Family />
      </div>
    </ProtectedRoute>
  );
}
