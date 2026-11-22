/**
 * MACHINE-DRAFTED TRANSLATION - NOT REVIEWED BY A NATIVE SPEAKER.
 *
 * This file contains initial Gujarati translations generated for Dastak.
 * Helpline names and portal names are kept in Latin script.
 * Plain, everyday Gujarati words are used instead of formal or bureaucratic terminology.
 * Sign-off required in docs/TRANSLATION_REVIEW.md before shipping to production.
 */

import { Copy } from './types';
import { guUiCommon } from './gu/uiCommon';
import { guUiCases } from './gu/uiCases';
import { guUiFind } from './gu/uiFind';
import { guLadders, guCallScript } from './gu/ladders';
import { guPlaces, guFollowOfficialSite, guOtpSafetyTip } from './gu/places';
import { guDrafts } from './gu/drafts';

export const gu: Copy = {
  ...guUiCommon,
  ...guUiCases,
  ...guUiFind,
  ladders: guLadders,
  places: guPlaces,
  followOfficialSite: guFollowOfficialSite,
  otpSafetyTip: guOtpSafetyTip,
  callScript: guCallScript,
  drafts: guDrafts,
};
