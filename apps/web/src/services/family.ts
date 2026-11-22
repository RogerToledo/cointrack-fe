import { familyService } from './api';

export type {
  FamilyMember,
  Family,
  FamiliesResponse,
  FamilyInvite,
  InvitesResponse,
  MembersResponse,
} from '@cointrack/types';

export const createFamily = familyService.create;
export const getUserFamilies = familyService.getUserFamilies;
export const getFamilyMembers = familyService.getMembers;
export const inviteMember = familyService.inviteMember;
export const getPendingInvites = familyService.getPendingInvites;
export const acceptInvite = familyService.acceptInvite;
export const rejectInvite = familyService.rejectInvite;
