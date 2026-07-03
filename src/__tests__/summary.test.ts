import { describe, it, expect } from 'vitest';
import { getOdontogramSummary } from '../odontogram';
import { setI18nLanguage, t } from '../i18n/useI18n';

// getOdontogramSummary reads module-level tooth state. Without initOdontogram the
// state map is empty, which still exercises the full shape, the empty-section
// fallbacks, and — crucially — that every i18n key it references resolves to a
// real translation (t() returns the key itself when missing).
describe('getOdontogramSummary', () => {
  it('returns the expected structure with the four always-present sections', () => {
    setI18nLanguage('en');
    const s = getOdontogramSummary();
    expect(s.sections.map((sec) => sec.key)).toEqual(['caries', 'fillings', 'endo', 'prosthetics']);
    expect(typeof s.overview).toBe('string');
    expect(s.overview.length).toBeGreaterThan(0);
    expect(s.periodontalTitle.length).toBeGreaterThan(0);
    expect(s.periodontalText.length).toBeGreaterThan(0);
    // Implants section is present only when at least one implant exists.
    expect(s.implants).toBeNull();
  });

  it('shows empty-section text when no teeth match, and healthy periodontium', () => {
    setI18nLanguage('en');
    const s = getOdontogramSummary();
    for (const sec of s.sections) {
      expect(sec.items).toEqual([]);
      expect(sec.emptyText).toBe(sec.emptyText); // present
      expect(sec.emptyText).not.toContain('toothInfo.'); // resolved, not a raw key
    }
    expect(s.periodontalText).toBe(t('toothInfo.periodontalHealthy', 'en'));
  });

  it('resolves all referenced i18n keys (no raw keys leak through)', () => {
    for (const lang of ['hu', 'en', 'de', 'es', 'it', 'sk', 'pl', 'ru'] as const) {
      setI18nLanguage(lang);
      const s = getOdontogramSummary();
      const texts = [s.overview, s.periodontalTitle, s.periodontalText, ...s.sections.flatMap((sec) => [sec.heading, sec.emptyText])];
      for (const txt of texts) {
        // No raw i18n key should leak through, including interpolated phrase keys.
        expect(txt).not.toMatch(/toothInfo\./);
      }
    }
  });
});
