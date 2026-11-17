/**
 * MACHINE-DRAFTED TRANSLATION - NOT REVIEWED BY A NATIVE SPEAKER.
 *
 * This file contains initial Hindi translations generated for Dastak.
 * Helpline names and portal names are kept in Latin script.
 * Plain, everyday Hindi words are used instead of formal or bureaucratic terminology.
 * Sign-off required in docs/TRANSLATION_REVIEW.md before shipping to production.
 */

import { Copy } from './types';
import { hiUiCommon } from './hi/uiCommon';
import { hiUiCases } from './hi/uiCases';
import { hiUiFind } from './hi/uiFind';
import { hiLadders, hiCallScript } from './hi/ladders';
import { hiPlaces, hiFollowOfficialSite, hiOtpSafetyTip } from './hi/places';

export const hi: Copy = {
  ...hiUiCommon,
  ...hiUiCases,
  ...hiUiFind,
  ladders: hiLadders,
  places: hiPlaces,
  followOfficialSite: hiFollowOfficialSite,
  otpSafetyTip: hiOtpSafetyTip,
  callScript: hiCallScript,
};
