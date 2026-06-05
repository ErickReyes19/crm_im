export const HONDURAS_TIME_ZONE = "America/Tegucigalpa";

const HONDURAS_MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

type HondurasDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getHondurasDateParts(fecha: Date | string | number) {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HONDURAS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hondurasParts: HondurasDateParts = {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };

  return Object.values(hondurasParts).every((value) => Number.isFinite(value)) ? hondurasParts : null;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatSpanishMeridiem(hour: number) {
  return hour < 12 ? "a. m." : "p. m.";
}

function formatHour12(hour: number) {
  const hour12 = hour % 12;
  return hour12 === 0 ? 12 : hour12;
}

export function formatHondurasDateTime(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "Sin registro";

  const parts = getHondurasDateParts(fecha);
  if (!parts) return "Fecha inválida";

  return `${parts.day} ${HONDURAS_MONTHS_SHORT[parts.month - 1]} ${parts.year}, ${formatHour12(parts.hour)}:${padDatePart(parts.minute)} ${formatSpanishMeridiem(parts.hour)}`;
}

export function formatHondurasDate(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "Sin registro";

  const parts = getHondurasDateParts(fecha);
  if (!parts) return "Fecha inválida";

  return `${padDatePart(parts.day)}/${padDatePart(parts.month)}/${parts.year}`;
}

export function formatHondurasInputDate(fecha: Date | string | number | null | undefined) {
  if (!fecha) return "";

  const parts = getHondurasDateParts(fecha);
  if (!parts) return "";

  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
}
