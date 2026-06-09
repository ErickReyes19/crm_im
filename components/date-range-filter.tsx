import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateRangePreset, getDateRangePresetInputs } from "@/lib/list-date-range";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

type DateRangeFilterProps = {
  from: string;
  to: string;
  title?: string;
  description?: string;
  baseHref: string;
  presets?: DateRangePreset[];
  defaultPreset?: DateRangePreset;
  alwaysApplyPresetParams?: boolean;
  showAllHref?: string;
  showAllLabel?: string;
  showAllActive?: boolean;
};

const presetLabels: Record<DateRangePreset, string> = {
  today: "Hoy",
  week: "Semana actual",
  month: "Mes actual",
  "30days": "Últimos 30 días",
};

const defaultPresets: DateRangePreset[] = ["today", "week", "month", "30days"];

function createRangeHref(
  baseHref: string,
  preset: DateRangePreset,
  defaultPreset: DateRangePreset,
  alwaysApplyPresetParams = false,
) {
  if (!alwaysApplyPresetParams && preset === defaultPreset) return baseHref;

  const range = getDateRangePresetInputs(preset);
  const params = new URLSearchParams({ from: range.from!, to: range.to! });
  return `${baseHref}?${params.toString()}`;
}

function matchesPreset(from: string, to: string, preset: DateRangePreset) {
  const range = getDateRangePresetInputs(preset);
  return range.from === from && range.to === to;
}

export default function DateRangeFilter({
  from,
  to,
  title = "Filtro por rango de fecha",
  description = "Por defecto se muestran los registros de la semana actual. Usa los accesos rápidos o cambia el rango para consultar otros registros.",
  baseHref,
  presets = defaultPresets,
  defaultPreset = "week",
  alwaysApplyPresetParams = false,
  showAllHref,
  showAllLabel = "Ver todo",
  showAllActive = false,
}: DateRangeFilterProps) {
  const activePreset = presets.find((preset) => matchesPreset(from, to, preset));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset} asChild variant={activePreset === preset ? "secondary" : "outline"} size="sm">
              <Link href={createRangeHref(baseHref, preset, defaultPreset, alwaysApplyPresetParams)}>{presetLabels[preset]}</Link>
            </Button>
          ))}
          {showAllHref && (
            <Button asChild variant={showAllActive ? "secondary" : "outline"} size="sm">
              <Link href={showAllHref}>{showAllLabel}</Link>
            </Button>
          )}
        </div>
        <form action={baseHref} method="get" className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="space-y-2 text-sm font-medium">
            Desde
            <Input name="from" type="date" defaultValue={from} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Hasta
            <Input name="to" type="date" defaultValue={to} />
          </label>
          <Button type="submit">Aplicar rango</Button>
        </form>
      </CardContent>
    </Card>
  );
}
