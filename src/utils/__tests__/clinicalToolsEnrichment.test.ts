import { describe, expect, it } from 'vitest';
import { medications } from '../../data/pharmacology';
import { questionnaires } from '../../data/questionnaires';
import { loadGynData } from '../../data/loadGynData';
import { loadObsData } from '../../data/loadObsData';

const hasItems = (value: unknown) => Array.isArray(value) && value.length > 0;

describe('clinical content enrichment', () => {
  it('provides the mandatory clinical minimum for every disease after enrichment', async () => {
    const [gynecology, obstetrics] = await Promise.all([loadGynData(), loadObsData()]);

    for (const disease of [...gynecology, ...obstetrics]) {
      expect(hasItems(disease.guidelineBasis), disease.id).toBe(true);
      expect(disease.guidelineStatus, disease.id).toBeTruthy();
      expect(disease.lastReviewed, disease.id).toBeTruthy();
      expect(disease.sourceQuality, disease.id).toBeTruthy();
      expect(hasItems(disease.redFlags), disease.id).toBe(true);
      expect(disease.diagnosticCriteria, disease.id).toBeTruthy();
      expect(hasItems(disease.differentialDiagnosis), disease.id).toBe(true);
      expect(disease.managementAlgorithm, disease.id).toBeTruthy();
      expect(disease.followUpTriggers, disease.id).toBeTruthy();
      expect(disease.clinicalSummary, disease.id).toBeTruthy();
      expect(disease.patientExplanation, disease.id).toBeTruthy();
      expect(disease.editorialStatus, disease.id).toBeTruthy();
      expect(hasItems(disease.sourceStack), disease.id).toBe(true);
      expect(disease.sourceDate, disease.id).toBeTruthy();
      expect(disease.revisionDue, disease.id).toBeTruthy();
      expect(disease.sourceConfidence, disease.id).toBeTruthy();
      expect(hasItems(disease.clinicalPathway), disease.id).toBe(true);
      expect(hasItems(disease.urgentPathway), disease.id).toBe(true);
      expect(hasItems(disease.treatmentPathway), disease.id).toBe(true);
      expect(hasItems(disease.ultrasoundChecklist), disease.id).toBe(true);
      expect(disease.atlasScene, disease.id).toBeTruthy();
      expect(hasItems(disease.atlasHotspots), disease.id).toBe(true);
      expect(disease.aiPrompts, disease.id).toBeTruthy();
    }
  }, 15000);

  it('provides the mandatory clinical minimum for every medication', () => {
    for (const medication of medications) {
      expect(medication.firstLineStatus, medication.id).toBeTruthy();
      expect(medication.pregnancyLactation, medication.id).toBeTruthy();
      expect(medication.monitoring, medication.id).toBeTruthy();
      expect(hasItems(medication.clinicalUseCases), medication.id).toBe(true);
      expect(hasItems(medication.majorPracticePoints), medication.id).toBe(true);
      expect(medication.comparativeRole, medication.id).toBeTruthy();
      expect(medication.routeAndSetting, medication.id).toBeTruthy();
      expect(hasItems(medication.guidelineBasis), medication.id).toBe(true);
      expect(medication.lastReviewed, medication.id).toBeTruthy();
    }
  });

  it('provides the mandatory clinical minimum for every questionnaire', () => {
    for (const questionnaire of questionnaires) {
      expect(questionnaire.clinicalPurpose, questionnaire.id).toBeTruthy();
      expect(questionnaire.targetPopulation, questionnaire.id).toBeTruthy();
      expect(hasItems(questionnaire.cutoffInterpretation), questionnaire.id).toBe(true);
      expect(questionnaire.nextStepByScore, questionnaire.id).toBeTruthy();
      expect(hasItems(questionnaire.limitations), questionnaire.id).toBe(true);
      expect(hasItems(questionnaire.evidenceNote), questionnaire.id).toBe(true);
      expect(hasItems(questionnaire.guidelineBasis), questionnaire.id).toBe(true);
      expect(questionnaire.lastReviewed, questionnaire.id).toBeTruthy();
    }
  });
});
