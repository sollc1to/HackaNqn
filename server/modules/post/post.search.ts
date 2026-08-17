import type { QueryFilter } from 'mongoose';

import type { Post, SearchPostsQuery } from './post.interfaces';

const earthRadiusKm = 6371;
const defaultRadiusKm = 20;
const defaultLimit = 20;
const maxLimit = 100;

// escapa caracteres especiales de regex.
export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// separa una consulta libre en terminos.
function toTerms(value: string) {
  return value
    .split(/\s+/)
    .map(term => term.trim())
    .filter(Boolean);
}

// condicion de texto para un termino dado.
function termConditions(term: string): Record<string, unknown> {
  const pattern = new RegExp(escapeRegex(term), 'i');

  return {
    $or: [
      { title: { $regex: pattern } },
      { description: { $regex: pattern } },
      { locationApprox: { $regex: pattern } },
      { 'location.label': { $regex: pattern } },
      { 'location.neighborhood': { $regex: pattern } },
    ],
  };
}

// formula haversine como expresion de agregacion.
function haversineExpr(lat: number, lng: number): Record<string, unknown> {
  const toRadians = Math.PI / 180;
  const latitude = { $ifNull: ['$location.latitude', 0] };
  const longitude = { $ifNull: ['$location.longitude', 0] };
  const latitudeDelta = { $subtract: [{ $multiply: [latitude, toRadians] }, { $multiply: [lat, toRadians] }] };
  const longitudeDelta = { $subtract: [{ $multiply: [longitude, toRadians] }, { $multiply: [lng, toRadians] }] };
  const haversin = (value: unknown) => ({ $pow: [{ $sin: { $divide: [value, 2] } }, 2] });

  return {
    $add: [
      haversin(latitudeDelta),
      {
        $multiply: [
          { $cos: { $multiply: [lat, toRadians] } },
          { $cos: { $multiply: [latitude, toRadians] } },
          haversin(longitudeDelta),
        ],
      },
    ],
  };
}

// calcula la distancia en km dentro de un pipeline de agregacion.
export function distanceKmExpression(lat: number, lng: number): Record<string, unknown> {
  return {
    $multiply: [
      earthRadiusKm * 2,
      { $asin: { $sqrt: haversineExpr(lat, lng) } },
    ],
  };
}

// arma la consulta de mongo a partir de los filtros recibidos.
export function buildSearchQuery(query: SearchPostsQuery = {}): QueryFilter<Post> {
  const conditions: Record<string, unknown>[] = [];

  // todos los terminos deben aparecer en alguno de los campos de texto.
  if (query.q) {
    const terms = toTerms(query.q);
    if (terms.length > 0) {
      conditions.push(...terms.map(termConditions));
    }
  }

  if (query.kind) conditions.push({ kind: query.kind });
  if (query.status) conditions.push({ status: query.status });
  if (query.tag) conditions.push({ tags: query.tag.toLowerCase() });
  if (query.category) conditions.push({ category: query.category });
  if (query.condition) conditions.push({ condition: query.condition });
  if (query.delivery) conditions.push({ delivery: query.delivery });
  if (query.locality) conditions.push({ 'location.locality': query.locality });
  if (query.neighborhood) conditions.push({ 'location.neighborhood': query.neighborhood });

  // filtra por distancia cuando llegan coordenadas.
  if (query.lat !== undefined && query.lng !== undefined) {
    const radiusKm = query.radiusKm ?? defaultRadiusKm;

    conditions.push({
      $expr: {
        $lt: [
          { $asin: { $sqrt: haversineExpr(query.lat, query.lng) } },
          radiusKm / (earthRadiusKm * 2),
        ],
      },
    });
  }

  return conditions.length > 0 ? ({ $and: conditions } as QueryFilter<Post>) : {};
}

// convierte pagina y limite en valores seguros para la base.
export function paginate(page: number | string | undefined = 1, limit: number | string | undefined = defaultLimit) {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.min(maxLimit, Math.max(1, Math.floor(Number(limit) || defaultLimit)));

  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}
