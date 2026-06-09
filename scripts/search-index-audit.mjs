import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { medications } from '../src/data/pharmacology.js';
import { questionnaires } from '../src/data/questionnaires.js';
import { repairText } from '../src/utils/textRepair.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const normalize = (value) =>
  repairText(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9.]+/gi, ' ')
    .trim();

const importChunks = async (dirName) => {
  const dir = path.join(root, 'src', 'data', dirName);
  const files = (await fs.readdir(dir))
    .filter((file) => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const chunks = await Promise.all(files.map((file) => import(pathToFileURL(path.join(dir, file)).href)));
  return chunks.flatMap((chunk) => chunk.default ?? []);
};

const collectStrings = (value, result = []) => {
  if (!value) return result;
  if (typeof value === 'string' || typeof value === 'number') {
    result.push(String(value));
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStrings(entry, result));
    return result;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((entry) => collectStrings(entry, result));
  }
  return result;
};

const scopeDiseaseDocs = (items, scope) => {
  const seen = new Map();

  return items.map((item) => {
    const baseId = String(item.id || item.name || item.icd).trim().replace(/\s+/g, '-');
    const duplicateIndex = seen.get(baseId) ?? 0;
    seen.set(baseId, duplicateIndex + 1);

    const scopedCanonicalId = `${baseId}__${scope}`;
    const scopedId = duplicateIndex === 0 ? scopedCanonicalId : `${baseId}-${duplicateIndex + 1}__${scope}`;
    const title = repairText(item.name);
    const icd = repairText(item.icd);

    return {
      type: 'disease',
      id: scopedId,
      canonicalKey: `disease:${normalize(title)}:${normalize(icd)}`,
      title,
      icd,
      text: normalize(collectStrings(item).join(' ')),
    };
  });
};

const [gyn, obs] = await Promise.all([importChunks('gynChunks'), importChunks('obsChunks')]);
const diseaseDocs = [...scopeDiseaseDocs(gyn, 'gyn'), ...scopeDiseaseDocs(obs, 'obs')];
const medicationDocs = medications.map((item) => ({
  type: 'medication',
  id: String(item.id).trim(),
  canonicalKey: `medication:${normalize(item.name)}:${normalize(item.id)}`,
  title: repairText(item.name),
  text: normalize(collectStrings(item).join(' ')),
}));
const questionnaireDocs = questionnaires.map((item) => ({
  type: 'questionnaire',
  id: String(item.id).trim(),
  canonicalKey: `questionnaire:${normalize(item.name)}:${normalize(item.id)}`,
  title: repairText(item.name),
  text: normalize(collectStrings(item).join(' ')),
}));

const docs = [...diseaseDocs, ...medicationDocs, ...questionnaireDocs];
const aliases = {
  hpv: ['впч', 'папилломавирус'],
  hiv: ['вич'],
  ivf: ['эко', 'экстракорпоральное'],
  pcos: ['спкя', 'e28.2'],
  pid: ['взомт', 'n70'],
};

const search = (query) => {
  const terms = normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((term) => [term, ...(aliases[term] ?? [])]);
  const seenResults = new Set();

  return docs
    .map((doc) => ({
      doc,
      score: terms.reduce((score, term) => score + (doc.text.includes(normalize(term)) ? 1 : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((entry) => {
      if (seenResults.has(entry.doc.canonicalKey)) return false;
      seenResults.add(entry.doc.canonicalKey);
      return true;
    })
    .slice(0, 8)
    .map((entry) => ({ type: entry.doc.type, id: entry.doc.id, title: entry.doc.title, icd: entry.doc.icd, score: entry.score }));
};

const requiredQueries = [
  'эндометриоз n80',
  'миома d25',
  'рак шейки c53',
  'спкя e28.2',
  'преэклампсия o14',
  'кровотечение o46',
  'прогестерон',
  'контрацепция',
  'депрессия шкала',
  'беременность гипертензия',
];

const queries = requiredQueries.map((query) => ({ query, results: search(query) }));
const failures = queries.filter((entry) => entry.results.length === 0);
const malformedIds = docs
  .filter((doc) => doc.id !== doc.id.trim() || /\s/.test(doc.id))
  .slice(0, 20)
  .map((doc) => ({ type: doc.type, id: doc.id, title: doc.title }));
const duplicateResultFindings = queries
  .map((entry) => {
    const keys = entry.results.map((result) => `${result.type}:${normalize(result.title)}:${normalize(result.icd ?? '')}`);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    return { query: entry.query, duplicates: [...new Set(duplicates)] };
  })
  .filter((entry) => entry.duplicates.length > 0);

const report = {
  ok: failures.length === 0 && malformedIds.length === 0 && duplicateResultFindings.length === 0,
  generatedAt: new Date().toISOString(),
  totals: {
    diseases: diseaseDocs.length,
    medications: medicationDocs.length,
    questionnaires: questionnaireDocs.length,
    all: docs.length,
  },
  queries,
  failures,
  malformedIds,
  duplicateResultFindings,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'search-index-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);