import { personService } from './api';

export type {
  Person,
  PersonResponse,
  PeopleResponse,
  MeUser,
  MeResponse,
} from '@cointrack/types';

export const createPerson = personService.create;
export const updatePerson = personService.update;
export const deletePerson = personService.delete;
export const getPeople = personService.getById;
export const getPerson = personService.getMe;
