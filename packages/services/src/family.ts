import { AxiosInstance } from 'axios';
import {
  FamiliesResponse,
  InvitesResponse,
  MembersResponse,
} from '@cointrack/types';

export function createFamilyService(client: AxiosInstance) {
  return {
    create: async (name: string) => {
      const response = await client.post('/v1/families', { name });
      return response.data;
    },

    getUserFamilies: async () => {
      const response = await client.get<FamiliesResponse>('/v1/families');
      return response.data;
    },

    getMembers: async (familyId: string) => {
      const response = await client.get<MembersResponse>(
        `/v1/families/${familyId}/members`
      );
      return response.data;
    },

    inviteMember: async (familyId: string, email: string) => {
      const response = await client.post(`/v1/families/${familyId}/invite`, {
        email,
      });
      return response.data;
    },

    getPendingInvites: async () => {
      const response = await client.get<InvitesResponse>(
        '/v1/families/invites/pending'
      );
      return response.data;
    },

    acceptInvite: async (inviteId: string) => {
      const response = await client.post(`/v1/families/invites/${inviteId}/accept`);
      return response.data;
    },

    rejectInvite: async (inviteId: string) => {
      const response = await client.post(`/v1/families/invites/${inviteId}/reject`);
      return response.data;
    },
  };
}
