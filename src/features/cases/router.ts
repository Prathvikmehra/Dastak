import { IssueType } from './types';
import { DICTIONARY, KeywordDictionary } from './keywords';

export interface GuessResult {
  issue: IssueType | null;
  confidence: 'high' | 'low';
  matched: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchCategory(normalized: string, dict: KeywordDictionary): string[] {
  const matches = new Set<string>();

  for (const phrase of dict.phrases) {
    if (normalized.includes(phrase)) {
      matches.add(phrase);
    }
  }

  const tokens = new Set(normalized.split(' '));
  for (const word of dict.words) {
    if (tokens.has(word)) {
      matches.add(word);
    }
  }

  return Array.from(matches);
}

/**
 * Pure function to inspect user text and guess the appropriate IssueType door.
 * - Device-only, no network, no external AI.
 * - Any strong fraud signal wins over refund, bank, or insurance.
 * - If two non-fraud categories tie with highest matches, returns null.
 */
export function guessIssue(text: string): GuessResult {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { issue: null, confidence: 'low', matched: [] };
  }

  const fraudMatches = matchCategory(normalized, DICTIONARY.fraud);
  if (fraudMatches.length > 0) {
    return {
      issue: 'fraud',
      confidence: 'high',
      matched: fraudMatches,
    };
  }

  const refundMatches = matchCategory(normalized, DICTIONARY.refund);
  const bankMatches = matchCategory(normalized, DICTIONARY.bank);
  const insuranceMatches = matchCategory(normalized, DICTIONARY.insurance);

  const scores: { issue: IssueType; matches: string[]; count: number }[] = [
    { issue: 'refund', matches: refundMatches, count: refundMatches.length },
    { issue: 'bank', matches: bankMatches, count: bankMatches.length },
    { issue: 'insurance', matches: insuranceMatches, count: insuranceMatches.length },
  ];

  scores.sort((a, b) => b.count - a.count);

  const top = scores[0];
  const second = scores[1];

  if (top.count === 0) {
    return { issue: null, confidence: 'low', matched: [] };
  }

  // Tie between top two non-fraud categories returns null
  if (top.count === second.count) {
    const allMatched = Array.from(new Set([...top.matches, ...second.matches]));
    return { issue: null, confidence: 'low', matched: allMatched };
  }

  const hasPhraseMatch = DICTIONARY[top.issue].phrases.some((p) => top.matches.includes(p));
  const confidence: 'high' | 'low' = top.count >= 2 || hasPhraseMatch ? 'high' : 'low';

  return {
    issue: top.issue,
    confidence,
    matched: top.matches,
  };
}

export const FRAUD_SHORTCUT_PARAMS = {
  issueType: 'fraud' as IssueType,
  fraudWhen: 'hour',
};

export function buildRouteParams(description: string): {
  note: string;
  issueType?: IssueType;
  routed: 'true' | 'false';
} {
  const trimmed = description.trim();
  const guess = guessIssue(trimmed);
  if (guess.issue) {
    return { note: description, issueType: guess.issue, routed: 'true' };
  }
  return { note: description, routed: 'false' };
}
