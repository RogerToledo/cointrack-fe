import { creditCardService } from './api';

export type {
  CreditCard,
  CreditCardResponse,
  CreditCardsResponse,
} from '@cointrack/types';

export const createCreditCard = creditCardService.create;
export const updateCreditCard = creditCardService.update;
export const deleteCreditCard = creditCardService.delete;
export const getCreditCard = creditCardService.getById;
export const getCreditCards = creditCardService.getAll;
export const getPhysicalCreditCards = creditCardService.getPhysical;
