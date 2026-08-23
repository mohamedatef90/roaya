import { CASE_STUDIES, CASE_STUDY_MAP, getCaseStudyBySlug } from './case-studies.data';

describe('case-studies.data (slug registry)', () => {
  it('registers exactly the published detail-page slugs', () => {
    expect(CASE_STUDIES.map((cs) => cs.slug).sort()).toEqual([
      'bank-cloud-migration',
      'ecommerce-auto-scaling',
      'government-digital-transformation',
      'healthcare-soc-implementation',
      'manufacturing-sap-implementation',
    ]);
  });

  it('has unique slugs', () => {
    const slugs = CASE_STUDIES.map((cs) => cs.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('maps every registered slug to its record', () => {
    for (const record of CASE_STUDIES) {
      expect(CASE_STUDY_MAP[record.slug]).toBe(record);
      expect(getCaseStudyBySlug(record.slug)).toBe(record);
    }
  });

  it('does not resolve the previously broken homepage slugs', () => {
    expect(getCaseStudyBySlug('national-bank-cloud-migration')).toBeUndefined();
    expect(getCaseStudyBySlug('healthcare-network-security')).toBeUndefined();
    expect(getCaseStudyBySlug('manufacturing-it-automation')).toBeUndefined();
  });
});
