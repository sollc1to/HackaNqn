const relativeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })
    : null;

function formatRelativeDay(dayDiff: number) {
  if (relativeFormatter) return relativeFormatter.format(dayDiff, 'day');
  if (dayDiff === -1) return 'ayer';
  if (dayDiff === 0) return 'hoy';
  if (dayDiff === 1) return 'mañana';
  return dayDiff < 0 ? `hace ${Math.abs(dayDiff)} días` : `dentro de ${dayDiff} días`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function formatRelativeDate(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  const dayDiff = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (dayDiff >= -1 && dayDiff <= 1) {
    const dayLabel = formatRelativeDay(dayDiff);
    return `${dayLabel.charAt(0).toUpperCase()}${dayLabel.slice(1)}, ${formatTime(iso)}`;
  }

  if (dayDiff > -7) return formatRelativeDay(dayDiff);

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
}

export function formatDateInput(iso?: string) {
  if (!iso) return '';
  const value = new Date(iso);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDateToIso(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

export function formatConversationDay(iso: string) {
  const date = new Date(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === -1) return 'Ayer';
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

export function sameCalendarDay(first: string, second: string) {
  return startOfDay(new Date(first)).getTime() === startOfDay(new Date(second)).getTime();
}
