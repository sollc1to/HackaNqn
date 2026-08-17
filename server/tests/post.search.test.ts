import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSearchQuery, distanceKmExpression, escapeRegex, paginate } from '../modules/post/post.search';

// escapa los caracteres especiales de regex.
test('escapeRegex escapes special characters', () => {
  assert.equal(escapeRegex('a+b?c'), 'a\\+b\\?c');
  assert.equal(escapeRegex('(x) [y]'), '\\(x\\) \\[y\\]');
  assert.equal(escapeRegex('plain'), 'plain');
});

// sin filtros devuelve una consulta vacia.
test('buildSearchQuery returns an empty query without filters', () => {
  assert.deepEqual(buildSearchQuery({}), {});
  assert.deepEqual(buildSearchQuery({ q: '   ' }), {});
});

// la consulta libre exige todos los terminos.
test('buildSearchQuery matches every term of a free-text query', () => {
  const query = buildSearchQuery({ q: 'abrigos invierno' }) as Record<string, unknown> & {
    $and: Array<{ $or: Array<Record<string, { $regex: RegExp }>> }>;
  };

  assert.ok(query.$and);
  assert.equal(query.$and.length, 2);

  const first = query.$and[0].$or;
  assert.equal(first.length, 5);
  assert.equal(first[0].title.$regex.source, 'abrigos');
  assert.equal(first[0].title.$regex.flags, 'i');

  const second = query.$and[1].$or;
  assert.equal(second[0].title.$regex.source, 'invierno');
});

// la consulta libre no falla con caracteres especiales.
test('buildSearchQuery escapes special characters in the query', () => {
  const query = buildSearchQuery({ q: 'campera (grande) +nueva?' }) as Record<string, unknown> & {
    $and: Array<{ $or: Array<Record<string, { $regex: RegExp }>> }>;
  };

  assert.ok(query.$and);
  const hasEscaped = query.$and.some(group => group.$or.some(field => field.title?.$regex.source.includes('\\(')));
  assert.ok(hasEscaped);
});

// los filtros de campo producen coincidencias exactas.
test('buildSearchQuery applies field filters as exact matches', () => {
  const query = buildSearchQuery({
    kind: 'donation',
    status: 'available',
    tag: 'Ropa',
    category: 'food',
    condition: 'new',
    delivery: 'can-deliver',
    locality: 'Neuquén capital',
    neighborhood: 'Confluencia',
  }) as Record<string, unknown> & { $and: Array<Record<string, unknown>> };

  assert.equal(query.$and.find(item => item.kind)?.kind, 'donation');
  assert.equal(query.$and.find(item => item.status)?.status, 'available');
  assert.equal(query.$and.find(item => item.tags)?.tags, 'ropa');
  assert.equal(query.$and.find(item => item.category)?.category, 'food');
  assert.equal(query.$and.find(item => item.condition)?.condition, 'new');
  assert.equal(query.$and.find(item => item.delivery)?.delivery, 'can-deliver');
  assert.equal(query.$and.find(item => item['location.locality'])?.['location.locality'], 'Neuquén capital');
  assert.equal(query.$and.find(item => item['location.neighborhood'])?.['location.neighborhood'], 'Confluencia');
});

// las coordenadas agregan un filtro de distancia con haversine.
test('buildSearchQuery adds a distance filter when coordinates are present', () => {
  const query = buildSearchQuery({ lat: -38.95, lng: -68.06, radiusKm: 10 }) as Record<string, unknown> & {
    $and: Array<{ $expr?: { $lt: unknown[] } }>;
  };
  const expr = query.$and.find(item => item.$expr)?.$expr;

  assert.ok(expr);
  assert.ok(Array.isArray(expr.$lt));
  assert.equal(expr.$lt.length, 2);
  assert.ok((expr.$lt[0] as { $asin?: unknown }).$asin);
  assert.ok(Math.abs((expr.$lt[1] as number) - 10 / (2 * 6371)) < 1e-12);
});

// usa el radio por defecto cuando llegan coordenadas sin radiusKm.
test('buildSearchQuery uses the default radius with coordinates only', () => {
  const query = buildSearchQuery({ lat: -38.95, lng: -68.06 }) as Record<string, unknown> & {
    $and: Array<{ $expr?: { $lt: unknown[] } }>;
  };
  const expr = query.$and.find(item => item.$expr)?.$expr;

  assert.ok(expr);
  assert.ok(Math.abs((expr.$lt[1] as number) - 20 / (2 * 6371)) < 1e-12);
});

// combina los filtros en una sola consulta.
test('buildSearchQuery combines text, filters and distance', () => {
  const query = buildSearchQuery({
    q: 'abrigo',
    category: 'clothes',
    lat: -38.95,
    lng: -68.06,
    radiusKm: 20,
  }) as Record<string, unknown> & { $and: unknown[] };

  assert.equal(query.$and.length, 3);
});

// la expresion de distancia se construye como un numero en km.
test('distanceKmExpression returns a distance expression', () => {
  const expr = distanceKmExpression(-38.95, -68.06) as Record<string, unknown>;

  assert.ok(expr.$multiply);
  assert.ok(Array.isArray(expr.$multiply));
  assert.equal(expr.$multiply[0], 2 * 6371);
  assert.ok((expr.$multiply[1] as { $asin?: unknown }).$asin);
});

// la paginacion aplica valores seguros.
test('paginate computes safe skip and limit', () => {
  assert.deepEqual(paginate(), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(paginate(3, 10), { page: 3, limit: 10, skip: 20 });
  assert.deepEqual(paginate(0, 0), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(paginate(2, 500), { page: 2, limit: 100, skip: 100 });
  assert.deepEqual(paginate('2', '15'), { page: 2, limit: 15, skip: 15 });
});
