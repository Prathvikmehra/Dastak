import { Copy } from './types';
import { enUi } from './en/ui';
import { enLadders, enCallScript } from './en/ladders';
import { enPlaces, enFollowOfficialSite, enOtpSafetyTip } from './en/places';

export const en: Copy = {
  ...enUi,
  ladders: enLadders,
  places: enPlaces,
  followOfficialSite: enFollowOfficialSite,
  otpSafetyTip: enOtpSafetyTip,
  callScript: enCallScript,
};

export const copy = en;
