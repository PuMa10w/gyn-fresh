import { enrichDiseases } from '../utils/enrichDiseases';
import type { Disease } from '../types';

const gynChunkLoaders = [
  () => import('./gynChunks/gynChunk1'),
  () => import('./gynChunks/gynChunk2'),
  () => import('./gynChunks/gynChunk3'),
  () => import('./gynChunks/gynChunk4'),
  () => import('./gynChunks/gynChunk5'),
  () => import('./gynChunks/gynChunk6'),
  () => import('./gynChunks/gynChunk7'),
  () => import('./gynChunks/gynChunk8'),
  () => import('./gynChunks/gynChunk9'),
  () => import('./gynChunks/gynChunk10'),
  () => import('./gynChunks/gynChunk11'),
  () => import('./gynChunks/gynChunk12'),
  () => import('./gynChunks/gynChunk13'),
  () => import('./gynChunks/gynChunk14'),
  () => import('./gynChunks/gynChunk15'),
  () => import('./gynChunks/gynChunk16'),
  () => import('./gynChunks/gynChunk17'),
  () => import('./gynChunks/gynChunk18'),
  () => import('./gynChunks/gynChunk19'),
  () => import('./gynChunks/gynChunk20'),
  () => import('./gynChunks/gynChunk21'),
  () => import('./gynChunks/gynChunk22'),
  () => import('./gynChunks/gynChunk23'),
  () => import('./gynChunks/gynChunk24'),
  // ICD-10 stub chunks (auto-generated)
  () => import('./gynChunks/gynChunk25'),
  () => import('./gynChunks/gynChunk26'),
  () => import('./gynChunks/gynChunk27'),
  () => import('./gynChunks/gynChunk28'),
  () => import('./gynChunks/gynChunk29'),
  () => import('./gynChunks/gynChunk30'),
];

function scopeDiseaseIds(diseases: Disease[], scope: 'gyn'): Disease[] {
  const seen = new Map<string, number>();

  return diseases.map((disease) => {
    const baseId = String(disease.id || disease.name || disease.icd).trim().replace(/\s+/g, '-');
    const duplicateIndex = seen.get(baseId) ?? 0;
    seen.set(baseId, duplicateIndex + 1);

    const scopedCanonicalId = `${baseId}__${scope}`;
    const scopedUniqueId = duplicateIndex === 0 ? scopedCanonicalId : `${baseId}-${duplicateIndex + 1}__${scope}`;

    return {
      ...disease,
      id: scopedUniqueId,
      canonicalIcd: disease.canonicalIcd ?? disease.icd,
      duplicateOf: duplicateIndex === 0 ? disease.duplicateOf : disease.duplicateOf ?? scopedCanonicalId,
    };
  });
}

export async function loadGynData(): Promise<Disease[]> {
  const chunks = await Promise.all(gynChunkLoaders.map((loadChunk) => loadChunk()));
  return scopeDiseaseIds(enrichDiseases(chunks.flatMap((chunk) => chunk.default as Disease[])), 'gyn');
}
