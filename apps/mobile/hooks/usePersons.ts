import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface Person {
  id: string;
  name: string;
}

export function usePersons() {
  return useCRUD<Person>({
    fetchFn: () => apiClient.get('/v1/person').then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/person/${id}`),
  });
}
