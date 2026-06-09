"use client";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatHondurasInputDate } from "@/lib/date-format";
import { ListTodo } from "lucide-react";

export type TareaInlineValues = {
  titulo: string;
  descripcion: string;
  fechaObjetivo: Date;
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
};

export const defaultTareaInlineValues = (): TareaInlineValues => ({
  titulo: "",
  descripcion: "",
  fechaObjetivo: new Date(),
  estado: "PENDIENTE",
});

export function InlineTareaSection({
  enabled,
  onEnabledChange,
  values,
  onChange,
  disabled = false,
  description,
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  values: TareaInlineValues;
  onChange: (values: TareaInlineValues) => void;
  disabled?: boolean;
  description?: string;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-muted/20 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="inline-tarea-toggle" className="font-medium">Agregar tarea</Label>
        </div>
        <Switch
          id="inline-tarea-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="space-y-4 border-t pt-4">
          <Field>
            <FieldLabel>Título</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Ej. Llamar para seguimiento"
                value={values.titulo}
                onChange={(e) => onChange({ ...values, titulo: e.target.value })}
                disabled={disabled}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Descripción</FieldLabel>
            <FieldContent>
              <Textarea
                rows={3}
                placeholder="Detalle de la tarea..."
                value={values.descripcion}
                onChange={(e) => onChange({ ...values, descripcion: e.target.value })}
                disabled={disabled}
              />
            </FieldContent>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Fecha objetivo</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={formatHondurasInputDate(values.fechaObjetivo)}
                  onChange={(e) => onChange({ ...values, fechaObjetivo: new Date(`${e.target.value}T00:00:00`) })}
                  disabled={disabled}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select value={values.estado} onValueChange={(estado: TareaInlineValues["estado"]) => onChange({ ...values, estado })} disabled={disabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>

          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
      )}
    </section>
  );
}
