import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

type DateRangeFilterProps = {
  from: string;
  to: string;
  title?: string;
  description?: string;
  resetHref: string;
};

export default function DateRangeFilter({ from, to, title = "Filtro por rango de fecha", description = "Por defecto se muestran los registros del día. Cambia el rango para consultar otros registros.", resetHref }: DateRangeFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
          <label className="space-y-2 text-sm font-medium">
            Desde
            <Input name="from" type="date" defaultValue={from} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Hasta
            <Input name="to" type="date" defaultValue={to} />
          </label>
          <Button type="submit">Aplicar rango</Button>
          <Button asChild variant="outline"><Link href={resetHref}>Hoy</Link></Button>
        </form>
      </CardContent>
    </Card>
  );
}
