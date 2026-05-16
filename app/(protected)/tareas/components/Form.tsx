"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, updateTarea } from "../actions";
import { TareaFormValues, TareaSchema } from "../schema";

type TareaFormOutput = z.output<typeof TareaSchema>;

type UsuarioOpcion = { id: string; usuario: string };

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export function Formulario({ isUpdate, initialData, usuarios }: { isUpdate: boolean; initialData?: TareaFormValues; usuarios: UsuarioOpcion[] }) {
  const router = useRouter();
  const form = useForm<TareaFormValues, unknown, TareaFormOutput>({
    resolver: zodResolver(TareaSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: TareaFormOutput) {
    try {
      if (isUpdate) {
        await updateTarea(data);
        toast.success("Tarea actualizada.");
      } else {
        await createTarea(data);
        toast.success("Tarea creada.");
      }
      router.push("/tareas");
      router.refresh();
    } catch {
      toast.error("Error al guardar.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,420px)_minmax(180px,260px)_minmax(180px,260px)]">
        <Controller
          name="nombre"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nombre</FieldLabel>
              <FieldContent>
                <Input placeholder="Ej. Llamar para seguimiento" {...field} value={field.value ?? ""} />
              </FieldContent>
              <FieldDescription>Título corto y accionable.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="fechaFinalizacion"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-55">
              <FieldLabel>Fecha finalización</FieldLabel>
              <FieldContent>
                <Input type="date" value={toDateInputValue(field.value)} onChange={(event) => field.onChange(event.target.value)} />
              </FieldContent>
              <FieldDescription>Fecha compromiso.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="estado"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-60">
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecciona estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>Avance actual.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="descripcion"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-3xl">
            <FieldLabel>Descripción</FieldLabel>
            <FieldContent>
              <Textarea rows={4} placeholder="Describe el contexto, objetivo y próximos pasos" {...field} value={field.value ?? ""} />
            </FieldContent>
            <FieldDescription>Usa este espacio para instrucciones detalladas.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Controller
          name="asignadoAId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-sm">
              <FieldLabel>Asignado a</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
                  <SelectContent>{usuarios.map((usuario) => <SelectItem key={usuario.id} value={usuario.id}>{usuario.usuario}</SelectItem>)}</SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>Responsable de ejecutar la tarea.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="asignadoPorId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-sm">
              <FieldLabel>Asignado por</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
                  <SelectContent>{usuarios.map((usuario) => <SelectItem key={usuario.id} value={usuario.id}>{usuario.usuario}</SelectItem>)}</SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>Usuario que solicita o crea la tarea.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/tareas")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
