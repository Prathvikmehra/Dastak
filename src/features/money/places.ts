import { MoneyPlace, MoneyPlaceDefinition } from './types';
import { en } from '../../copy/en';
import { Copy } from '../../copy/types';

export const PLACE_DEFINITIONS: MoneyPlaceDefinition[] = [
  {
    id: 'udgam',
    portalName: 'RBI UDGAM',
    source: 'https://udgam.rbi.org.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
  },
  {
    id: 'bimabharosa',
    portalName: 'IRDAI Bima Bharosa',
    source: 'https://bimabharosa.irdai.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
  },
  {
    id: 'mfcentral',
    portalName: 'MITRA on MF Central',
    source: 'https://www.mfcentral.com',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
  },
  {
    id: 'iepf',
    portalName: 'IEPF Authority',
    source: 'https://www.iepf.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
  },
  {
    id: 'epfo',
    portalName: 'EPFO Member Portal',
    source: 'https://unifiedportal-mem.epfindia.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
  },
  {
    id: 'postoffice',
    portalName: 'Nearest Post Office',
    source: null,
    verifiedOn: null,
    contentStatus: 'general-guidance',
  },
];

export function getLocalizedPlaces(copy: Copy = en): MoneyPlace[] {
  return PLACE_DEFINITIONS.map((def) => {
    const pCopy = copy.places[def.id];
    const rawClaim = pCopy?.howToClaim || [];
    const howToClaim =
      rawClaim.length > 0 && rawClaim[rawClaim.length - 1] === copy.followOfficialSite
        ? [...rawClaim]
        : [...rawClaim, copy.followOfficialSite];

    return {
      id: def.id,
      title: pCopy?.title || pCopy?.name || '',
      subtitle: pCopy?.subtitle || '',
      portalName: def.portalName,
      source: def.source,
      verifiedOn: def.verifiedOn,
      contentStatus: def.contentStatus,
      covers: pCopy?.covers || '',
      keepReady: pCopy?.keepReady || [],
      howToSearch: pCopy?.howToSearch || [],
      howToClaim,
    };
  });
}

export const FOLLOW_OFFICIAL_SITE_NOTICE = en.followOfficialSite;
export const OTP_SAFETY_TIP = en.otpSafetyTip;
export const PLACES: MoneyPlace[] = getLocalizedPlaces(en);
