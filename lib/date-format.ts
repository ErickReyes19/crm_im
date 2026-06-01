export const HONDURAS_TIME_ZONE = "America/Tegucigalpa";

const HONDURAS_LOCALE = "es-HN";

export function formatHondurasDateTime(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "Sin registro";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat(HONDURAS_LOCALE, {
    timeZone: HONDURAS_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatHondurasDate(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "Sin registro";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat(HONDURAS_LOCALE, {
    timeZone: HONDURAS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatHondurasInputDate(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HONDURAS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
