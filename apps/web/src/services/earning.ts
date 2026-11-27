import { earningService } from './api';

export {
  PERIODICITIES,
  PERIODICITY_LABELS,
} from '@cointrack/types';
export type {
  EarningPeriodicity,
  EarningRecord,
  Earning,
  EarningResponse,
  EarningsResponse,
  EarningPayload,
  EarningDefinitionPayload,
  EarningRecordPayload,
} from '@cointrack/types';

export const createEarningDefinition = earningService.createDefinition;
export const createEarningRecord = earningService.createRecord;
export const deleteEarningRecord = earningService.deleteRecord;
export const updateEarning = earningService.update;
export const deleteEarning = earningService.delete;
export const getEarningBy = earningService.getById;
export const getEarnings = earningService.getAll;
export const getEarningsWithRecords = earningService.getAllWithRecords;
