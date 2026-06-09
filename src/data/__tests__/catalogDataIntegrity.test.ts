import { describe, expect, it } from 'vitest';
import { loadGynData } from '../loadGynData';
import { loadObsData } from '../loadObsData';

describe('catalog data integrity', () => {
  it('provides unique, renderable diseases for every card', async () => {
    const [gynecology, obstetrics] = await Promise.all([loadGynData(), loadObsData()]);
    const allDiseases = [...gynecology, ...obstetrics];
    const seenIds = new Set<string>();

    expect(allDiseases.length).toBeGreaterThan(0);

    for (const disease of allDiseases) {
      expect(disease.id.trim().length).toBeGreaterThan(0);
      expect(seenIds.has(disease.id)).toBe(false);
      seenIds.add(disease.id);

      expect(disease.name.trim().length).toBeGreaterThan(0);
      expect(disease.icd.trim().length).toBeGreaterThan(0);
      expect(disease.subtitle.trim().length).toBeGreaterThan(0);
      expect(disease.description.trim().length).toBeGreaterThan(0);
      expect(disease.icon.trim().length).toBeGreaterThan(0);
      expect(disease.definition.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(disease.symptoms)).toBe(true);
      expect(Array.isArray(disease.diagnostics.steps)).toBe(true);
      expect(Array.isArray(disease.treatment.conservative)).toBe(true);
      expect(Array.isArray(disease.treatment.surgical)).toBe(true);
    }
  }, 15000);
});
