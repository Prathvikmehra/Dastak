import { Copy } from './types';
import { enUi } from './en/ui';
import { enLadders, enCallScript } from './en/ladders';
import { enPlaces, enFollowOfficialSite, enOtpSafetyTip } from './en/places';
import { enDrafts } from './en/drafts';

export const en: Copy = {
  ...enUi,
  ladders: enLadders,
  places: enPlaces,
  followOfficialSite: enFollowOfficialSite,
  otpSafetyTip: enOtpSafetyTip,
  callScript: enCallScript,
  drafts: enDrafts,
};

export const copy = en;
