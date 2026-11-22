import { UiCopy } from './types/ui';
import { LadderCopy, PlaceCopy, CallScriptCopy, DraftsCopy } from './types/domain';

export type AppLanguage = 'en' | 'hi' | 'gu';

export interface Copy extends UiCopy {
  ladders: {
    refund: LadderCopy;
    fraud: LadderCopy;
    bank: LadderCopy;
    insurance: LadderCopy;
  };
  places: Record<string, PlaceCopy>;
  followOfficialSite: string;
  otpSafetyTip: string;
  callScript: CallScriptCopy;
  drafts: DraftsCopy;
}

export * from './types/ui';
export * from './types/domain';
