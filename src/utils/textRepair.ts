const cp1251Specials = new Map<string, number>([
  ['\u0402', 0x80], ['\u0403', 0x81], ['\u201A', 0x82], ['\u0453', 0x83], ['\u201E', 0x84], ['\u2026', 0x85], ['\u2020', 0x86], ['\u2021', 0x87], ['\u20AC', 0x88], ['\u2030', 0x89], ['\u0409', 0x8a], ['\u2039', 0x8b], ['\u040A', 0x8c], ['\u040C', 0x8d], ['\u040B', 0x8e], ['\u040F', 0x8f],
  ['\u0452', 0x90], ['\u2018', 0x91], ['\u2019', 0x92], ['\u201C', 0x93], ['\u201D', 0x94], ['\u2022', 0x95], ['\u2013', 0x96], ['\u2014', 0x97], ['\u2122', 0x99], ['\u0459', 0x9a], ['\u203A', 0x9b], ['\u045A', 0x9c], ['\u045C', 0x9d], ['\u045B', 0x9e], ['\u045F', 0x9f],
  ['\u00A0', 0xa0], ['\u040E', 0xa1], ['\u045E', 0xa2], ['\u0408', 0xa3], ['\u00A4', 0xa4], ['\u0490', 0xa5], ['\u00A6', 0xa6], ['\u00A7', 0xa7], ['\u0401', 0xa8], ['\u00A9', 0xa9], ['\u0404', 0xaa], ['\u00AB', 0xab], ['\u00AC', 0xac], ['\u00AD', 0xad], ['\u00AE', 0xae], ['\u0407', 0xaf],
  ['\u00B0', 0xb0], ['\u00B1', 0xb1], ['\u0406', 0xb2], ['\u0456', 0xb3], ['\u0491', 0xb4], ['\u00B5', 0xb5], ['\u00B6', 0xb6], ['\u00B7', 0xb7], ['\u0451', 0xb8], ['\u2116', 0xb9], ['\u0454', 0xba], ['\u00BB', 0xbb], ['\u0458', 0xbc], ['\u0405', 0xbd], ['\u0455', 0xbe], ['\u0457', 0xbf],
]);

const mojibakeTail = '\\u0080-\\u00ff\\u0402-\\u045f\\u201a-\\u201e\\u2020-\\u2022\\u2013\\u2014\\u2030\\u2039\\u203a\\u20ac\\u2122';
const mojibakeLead = '\\u0420\\u0421\\u0413\\u0432\\u00d0\\u00d1\\u00c2\\u00e2';
const mojibakePattern = new RegExp(`[${mojibakeLead}][${mojibakeTail}]|\\u0412[\\u00a9\\u00ae]|\\u043f\\u0457\\u0405|\\ufffd`);
const mojibakeScorePattern = new RegExp(`[${mojibakeLead}][${mojibakeTail}]|\\u0412[\\u00a9\\u00ae]|\\u043f\\u0457\\u0405|\\ufffd`, 'g');

function byteFor(char: string) {
  const code = char.codePointAt(0) ?? 0;
  if (code < 128) return code;
  if (code >= 0x80 && code <= 0x9f) return code;
  if (code <= 0xff) return code;
  if (code >= 0x410 && code <= 0x44f) return code - 0x350;
  return cp1251Specials.get(char) ?? null;
}

function score(value: string) {
  return (value.match(mojibakeScorePattern) ?? []).length;
}

function repairCandidate(value: string) {
  if (!mojibakePattern.test(value)) return value;

  const bytes: number[] = [];
  for (const char of value) {
    const byte = byteFor(char);
    if (byte === null) return value;
    bytes.push(byte);
  }

  try {
    const repaired = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
    return score(repaired) < score(value) ? repaired : value;
  } catch {
    return value;
  }
}

export function repairText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!mojibakePattern.test(text)) return text;

  let current = text;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!mojibakePattern.test(current)) break;
    const repaired = current
      .split(/(\s+)/)
      .map((part) => repairCandidate(part))
      .join('')
      .replace(new RegExp('\\u0420\\u045a\\u0420\\s*Т', 'g'), 'МРТ')
      .replace(/�+/g, '')
      .trim();

    if (repaired === current) break;
    current = repaired;
  }

  return current;
}

export function isObstetricsLabel(value: unknown): boolean {
  return repairText(value).toLowerCase().includes('акушер');
}
