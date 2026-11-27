import { getAllSources } from './sources';
import { LADDER_DEFINITIONS } from './ladders';
import { PLACE_DEFINITIONS } from '../money/places';
import { isContactVerified, getVerificationLabel } from '../../lib/verification';
import { en } from '../../copy/en';
import { hi } from '../../copy/hi';
import { gu } from '../../copy/gu';

describe('Sources and checks data generator', () => {
  it('proves every ladder step with a phone or link and every money place with a link appears exactly once', () => {
    const sources = getAllSources(en);
    const sourceIds = sources.map((s) => s.id);

    // No duplicate IDs
    const uniqueIds = new Set(sourceIds);
    expect(uniqueIds.size).toBe(sourceIds.length);

    // Every ladder step with phone or link is present exactly once
    const allLadderSteps = Object.values(LADDER_DEFINITIONS).flatMap((l) => l.steps);
    const stepsWithContact = allLadderSteps.filter((s) => Boolean(s.phone || s.link));

    expect(stepsWithContact.length).toBeGreaterThan(0);
    for (const step of stepsWithContact) {
      const matches = sources.filter((s) => s.id === step.id);
      expect(matches).toHaveLength(1);
      const match = matches[0];
      if (step.phone && step.link) {
        expect(match.contact).toContain(step.phone);
        expect(match.contact).toContain(step.link);
      } else if (step.phone) {
        expect(match.contact).toBe(step.phone);
      } else {
        expect(match.contact).toBe(step.link);
      }
    }

    // Every money place with a link (source) is present exactly once
    const placesWithLink = PLACE_DEFINITIONS.filter((p) => Boolean(p.source));
    expect(placesWithLink.length).toBeGreaterThan(0);
    for (const place of placesWithLink) {
      const matches = sources.filter((s) => s.id === place.id);
      expect(matches).toHaveLength(1);
      expect(matches[0].contact).toBe(place.source);
    }

    // Total count matches exact sum of contact steps and linked places
    expect(sources.length).toBe(stepsWithContact.length + placesWithLink.length);
  });

  it('tests that checked and unchecked entries render the right label', () => {
    const sources = getAllSources(en);

    for (const item of sources) {
      if (item.isVerified) {
        expect(item.verifiedOn).not.toBeNull();
        expect(item.verifiedAgainst).toMatch(/^https:\/\//);
        expect(item.statusLabel).toBe('Contact details checked on 26 Nov 2026');
      } else {
        expect(item.statusLabel).toBe('Not checked yet. Please confirm on the official site.');
      }
    }
  });

  it('proves count of "not checked yet" equals count of null verifiedOn entries', () => {
    const sources = getAllSources(en);
    const notCheckedCount = sources.filter(
      (s) => s.statusLabel === en.verification.notCheckedYet
    ).length;
    const nullVerifiedOnCount = sources.filter((s) => s.verifiedOn === null).length;

    expect(notCheckedCount).toBe(nullVerifiedOnCount);
    expect(notCheckedCount).toBe(7);
  });

  describe('Validation: never display a check date unless verifiedOn is non-null AND verifiedAgainst is https://', () => {
    it('rejects null or empty verifiedOn', () => {
      expect(isContactVerified(null, 'https://official.gov.in')).toBe(false);
      expect(isContactVerified(undefined, 'https://official.gov.in')).toBe(false);
      expect(isContactVerified('', 'https://official.gov.in')).toBe(false);
      expect(getVerificationLabel(null, 'https://official.gov.in', en.verification)).toBe(
        en.verification.notCheckedYet
      );
    });

    it('rejects invalid or legacy date strings in verifiedOn', () => {
      expect(isContactVerified('yesterday', 'https://official.gov.in')).toBe(false);
      expect(isContactVerified('2026-02-29', 'https://official.gov.in')).toBe(false); // non-leap year
      expect(getVerificationLabel('yesterday', 'https://official.gov.in', en.verification)).toBe(
        en.verification.notCheckedYet
      );
    });

    it('rejects non-https URLs in verifiedAgainst', () => {
      expect(isContactVerified('2026-11-26', 'http://insecure.gov.in')).toBe(false);
      expect(isContactVerified('2026-11-26', 'ftp://ftp.gov.in')).toBe(false);
      expect(isContactVerified('2026-11-26', null)).toBe(false);
      expect(isContactVerified('2026-11-26', '')).toBe(false);
      expect(getVerificationLabel('2026-11-26', 'http://insecure.gov.in', en.verification)).toBe(
        en.verification.notCheckedYet
      );
    });

    it('accepts valid LocalDate and https URL', () => {
      expect(isContactVerified('2026-11-26', 'https://official.gov.in')).toBe(true);
      expect(getVerificationLabel('2026-11-26', 'https://official.gov.in', en.verification)).toBe(
        'Contact details checked on 26 Nov 2026'
      );
    });
  });

  describe('Language support for verification labels and sources list', () => {
    it('renders Hindi labels correctly', () => {
      const hiSources = getAllSources(hi);
      const checkedItem = hiSources.find((s) => s.isVerified);
      expect(checkedItem?.statusLabel).toContain('को जाँचा गया');

      const uncheckedItem = hiSources.find((s) => !s.isVerified);
      expect(uncheckedItem?.statusLabel).toBe(hi.verification.notCheckedYet);
    });

    it('renders Gujarati labels correctly', () => {
      const guSources = getAllSources(gu);
      const checkedItem = guSources.find((s) => s.isVerified);
      expect(checkedItem?.statusLabel).toContain('ના રોજ ચકાસવામાં આવી');

      const uncheckedItem = guSources.find((s) => !s.isVerified);
      expect(uncheckedItem?.statusLabel).toBe(gu.verification.notCheckedYet);
    });
  });
});
