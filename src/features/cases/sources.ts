import { LADDER_DEFINITIONS } from './ladders';
import { PLACE_DEFINITIONS } from '../money/places';
import { isContactVerified, getVerificationLabel } from '../../lib/verification';
import { Copy } from '../../copy/types';
import { en } from '../../copy/en';
import { IssueType } from './types';

export interface SourceItem {
  id: string;
  name: string;
  contact: string;
  verifiedOn: string | null;
  verifiedAgainst: string | null;
  statusLabel: string;
  isVerified: boolean;
}

const ISSUE_TYPES: IssueType[] = ['refund', 'fraud', 'bank', 'insurance'];

export function getAllSources(copy: Copy = en): SourceItem[] {
  const items: SourceItem[] = [];

  // 1. Ladder steps with a phone or link
  for (const issueType of ISSUE_TYPES) {
    const def = LADDER_DEFINITIONS[issueType];
    const ladderCopy = copy.ladders[issueType];
    for (const step of def.steps) {
      if (step.phone || step.link) {
        const stepCopy = ladderCopy.steps[step.id];
        const contactParts: string[] = [];
        if (step.phone) contactParts.push(step.phone);
        if (step.link) contactParts.push(step.link);

        const verifiedOn = step.verifiedOn || null;
        const verifiedAgainst = step.verifiedAgainst || null;
        const isVerified = isContactVerified(verifiedOn, verifiedAgainst);
        const statusLabel = getVerificationLabel(verifiedOn, verifiedAgainst, copy.verification);

        items.push({
          id: step.id,
          name: stepCopy?.who || step.id,
          contact: contactParts.join(' • '),
          verifiedOn,
          verifiedAgainst,
          statusLabel,
          isVerified,
        });
      }
    }
  }

  // 2. Money places with a link (source)
  for (const place of PLACE_DEFINITIONS) {
    if (place.source) {
      const pCopy = copy.places[place.id];
      const verifiedOn = place.verifiedOn || null;
      const verifiedAgainst = place.verifiedAgainst || null;
      const isVerified = isContactVerified(verifiedOn, verifiedAgainst);
      const statusLabel = getVerificationLabel(verifiedOn, verifiedAgainst, copy.verification);

      items.push({
        id: place.id,
        name: pCopy?.title || pCopy?.name || place.portalName,
        contact: place.source,
        verifiedOn,
        verifiedAgainst,
        statusLabel,
        isVerified,
      });
    }
  }

  return items;
}
