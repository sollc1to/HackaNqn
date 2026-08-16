const synonymGroups = [
  ['campera', 'camperas', 'abrigo', 'abrigos', 'buzo', 'buzos', 'ropa'],
  ['comida', 'alimento', 'alimentos', 'mercaderia', 'víveres', 'viveres'],
  ['cuaderno', 'cuadernos', 'lapiz', 'lápiz', 'utiles', 'útiles', 'escolar', 'escolares'],
  ['silla de ruedas', 'wheelchair', 'movilidad', 'salud'],
  ['mesa', 'escritorio', 'mueble', 'muebles'],
  ['donar', 'donacion', 'donación', 'ofrecer', 'regalar'],
  ['pedir', 'necesitar', 'solicitud', 'busco'],
];

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(first: string, second: string) {
  const rows = Array.from({ length: first.length + 1 }, (_, index) => index);
  for (let column = 1; column <= second.length; column += 1) {
    let previous = rows[0];
    rows[0] = column;
    for (let row = 1; row <= first.length; row += 1) {
      const current = rows[row];
      rows[row] = Math.min(
        rows[row] + 1,
        rows[row - 1] + 1,
        previous + (first[row - 1] === second[column - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return rows[first.length];
}

function expandedTerms(term: string) {
  const normalized = normalizeText(term);
  const group = synonymGroups.find(items => items.some(item => normalizeText(item) === normalized));
  return (group ?? [normalized]).map(normalizeText);
}

export function fuzzyIncludes(haystack: string, query: string) {
  const normalizedHaystack = normalizeText(haystack);
  const words = normalizedHaystack.split(' ');
  const queryWords = normalizeText(query).split(' ').filter(Boolean);
  if (queryWords.length === 0) return true;

  return queryWords.every(queryWord =>
    expandedTerms(queryWord).some(term => {
      if (normalizedHaystack.includes(term)) return true;
      if (term.length < 4) return false;
      return words.some(word => levenshtein(word, term) <= (term.length >= 7 ? 2 : 1));
    }),
  );
}

const exactAddressPatterns = [
  /\b(?:calle|av(?:enida)?\.?|ruta|diagonal|pasaje|pje\.?)\s+[a-záéíóúñ\s]+\s+\d{2,5}\b/i,
  /\b[a-záéíóúñ]{3,}(?:\s+[a-záéíóúñ]{3,})?\s+\d{2,5}\b/i,
];

export function containsExactAddress(value: string) {
  return exactAddressPatterns.some(pattern => pattern.test(value));
}

const prohibitedPatterns = [
  /medicamento(?:s)?\s+abierto/i,
  /comida\s+vencida/i,
  /alimento(?:s)?\s+vencido/i,
  /\bsangre\b/i,
  /arma(?:s)?\b/i,
  /munici[oó]n/i,
  /explosivo/i,
  /sustancia(?:s)?\s+peligrosa/i,
];

export function findProhibitedContent(value: string) {
  return prohibitedPatterns.find(pattern => pattern.test(value))?.source;
}
