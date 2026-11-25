import { IssueType } from './types';
import { STRONG_FRAUD, WEAK_FRAUD, NON_FRAUD_DICTIONARY, KeywordDictionary } from './keywords';

export interface GuessResult {
  issue: IssueType | null;
  confidence: 'high' | 'low';
  matched: string[];
  candidates: IssueType[];
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
 * - Any strong fraud signal wins outright.
 * - Weak fraud signal alone resolves to fraud.
 * - If only weak fraud signals are present together with another category,
 *   returns issue null and candidates [that category, 'fraud'].
 * - Two non-fraud categories tied return issue null and candidates of both.
 */
export function guessIssue(text: string): GuessResult {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { issue: null, confidence: 'low', matched: [], candidates: [] };
  }

  const strongFraudMatches = matchCategory(normalized, STRONG_FRAUD);
  if (strongFraudMatches.length > 0) {
    return {
      issue: 'fraud',
      confidence: 'high',
      matched: strongFraudMatches,
      candidates: ['fraud'],
    };
  }

  const weakFraudMatches = matchCategory(normalized, WEAK_FRAUD);
  const refundMatches = matchCategory(normalized, NON_FRAUD_DICTIONARY.refund);
  const bankMatches = matchCategory(normalized, NON_FRAUD_DICTIONARY.bank);
  const insuranceMatches = matchCategory(normalized, NON_FRAUD_DICTIONARY.insurance);

  const hasBankFeeOrEmi =
    normalized.includes('emi') ||
    normalized.includes('ઈએમઆઈ') ||
    normalized.includes('ईएमआई') ||
    normalized.includes('charge') ||
    normalized.includes('चार्') ||
    normalized.includes('ચાર્');
  const effectiveWeakFraudMatches = hasBankFeeOrEmi
    ? weakFraudMatches.filter(
        (m) => !['deducted', 'debited', 'paise kat gaye', 'rupaye kat gaye'].includes(m)
      )
    : weakFraudMatches;

  const scores: {
    issue: Exclude<IssueType, 'fraud'>;
    matches: string[];
    count: number;
  }[] = [
    { issue: 'refund', matches: refundMatches, count: refundMatches.length },
    { issue: 'bank', matches: bankMatches, count: bankMatches.length },
    { issue: 'insurance', matches: insuranceMatches, count: insuranceMatches.length },
  ];

  scores.sort((a, b) => b.count - a.count);

  const top = scores[0];
  const second = scores[1];

  if (effectiveWeakFraudMatches.length > 0) {
    if (top.count > 0) {
      return {
        issue: null,
        confidence: 'low',
        matched: Array.from(new Set([...top.matches, ...effectiveWeakFraudMatches])),
        candidates: [top.issue, 'fraud'],
      };
    }
    return {
      issue: 'fraud',
      confidence: 'high',
      matched: effectiveWeakFraudMatches,
      candidates: ['fraud'],
    };
  }

  if (top.count === 0) {
    return { issue: null, confidence: 'low', matched: [], candidates: [] };
  }

  if (top.count === second.count) {
    const allMatched = Array.from(new Set([...top.matches, ...second.matches]));
    return {
      issue: null,
      confidence: 'low',
      matched: allMatched,
      candidates: [top.issue, second.issue],
    };
  }

  const hasPhraseMatch = NON_FRAUD_DICTIONARY[top.issue].phrases.some((p) =>
    top.matches.includes(p)
  );
  const confidence: 'high' | 'low' = top.count >= 2 || hasPhraseMatch ? 'high' : 'low';

  return {
    issue: top.issue,
    confidence,
    matched: top.matches,
    candidates: [top.issue],
  };
}

export const FRAUD_SHORTCUT_PARAMS = {
  issueType: 'fraud' as IssueType,
  fraudWhen: 'hour',
};

export function buildRouteParams(description: string): {
  note: string;
  issueType?: IssueType;
  candidates?: string;
  routed: 'true' | 'false';
} {
  const trimmed = description.trim();
  const guess = guessIssue(trimmed);
  if (guess.issue) {
    return {
      note: description,
      issueType: guess.issue,
      candidates: guess.candidates.join(','),
      routed: 'true',
    };
  }
  if (guess.candidates.length === 2) {
    return {
      note: description,
      candidates: guess.candidates.join(','),
      routed: 'true',
    };
  }
  return { note: description, routed: 'false' };
}
