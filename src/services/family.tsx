import instance from "./config";

export interface FamilyMember {
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

export interface Family {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    members?: FamilyMember[];
}

export interface FamiliesResponse {
    message: Family | Family[];
    statusCode: number;
}

export interface FamilyInvite {
    id: string;
    family_id: string;
    person_id: string;
    role: string;
    status: 'pending' | 'accepted' | 'rejected';
    invited_at: string;
    person_name: string;
    family_name: string;
}

export interface InvitesResponse {
    message: FamilyInvite[];
    statusCode: number;
}

export interface MembersResponse {
    message: FamilyMember[];
    statusCode: number;
}

// Criar família
export const createFamily = async (name: string) => {
    const response = await instance.post('/v1/families', {
        name: name,
    });
    return response.data;
}

// Obter todas as famílias do usuário
export const getUserFamilies = async () => {
    const response = await instance.get<FamiliesResponse>(`/v1/families`);
    return response.data;
}

// Obter membros de uma família
export const getFamilyMembers = async (familyId: string) => {
    const response = await instance.get<MembersResponse>(`/v1/families/${familyId}/members`);
    return response.data;
}

// Convidar membro para família
export const inviteMember = async (familyId: string, email: string) => {
    const response = await instance.post(`/v1/families/${familyId}/invite`, {
        email: email,
    });
    return response.data;
}

// Listar convites pendentes
export const getPendingInvites = async () => {
    const response = await instance.get<InvitesResponse>('/v1/families/invites/pending');
    return response.data;
}

// Aceitar convite
export const acceptInvite = async (inviteId: string) => {
    const response = await instance.post(`/v1/families/invites/${inviteId}/accept`);
    return response.data;
}

// Rejeitar convite
export const rejectInvite = async (inviteId: string) => {
    const response = await instance.post(`/v1/families/invites/${inviteId}/reject`);
    return response.data;
}
