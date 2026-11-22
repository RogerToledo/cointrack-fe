import { AxiosInstance } from 'axios';
import { MeResponse, PeopleResponse } from '@cointrack/types';

export function createPersonService(client: AxiosInstance) {
  return {
    create: async (name: string) => {
      const response = await client.post('/v1/person', { name });
      return response.data;
    },

    update: async (id: string, name: string) => {
      const response = await client.put('/v1/person', { id, name });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/person/${id}`);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<PeopleResponse>(`/v1/person/${id}`);
      return response.data;
    },

    getMe: async () => {
      const response = await client.get<MeResponse>('/v1/me');
      return response.data;
    },
  };
}
