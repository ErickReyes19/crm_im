"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, updateTarea } from "../actions";
import { TareaFormValues, TareaSchema } from "../schema";

type TareaFormOutput = z.output<typeof TareaSchema>;

type UsuarioOpcion = { id: string; usuario: string };
type ProductoOpcion = { id: string; nombre: string; precio: number };

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export function Formulario({ isUpdate, initialData, usuarios, productos }: { isUpdate: boolean; initialData?: TareaFormValues; usuarios: UsuarioOpcion[]; productos: ProductoOpcion[] }) {
  const router = useRouter();
  const form = useForm<TareaFormValues, unknown, TareaFormOutput>({
    resolver: zodResolver(TareaSchema),
    defaultValues: initialData,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "productosObjetivo" });

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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar.");
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


      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Objetivo de productos</h3>
            <p className="text-sm text-muted-foreground">Opcionalmente indica qué productos debe vender el usuario asignado.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => append({ productoId: productos[0]?.id ?? "", cantidadObjetivo: 1 })} disabled={productos.length === 0}><Plus className="mr-2 h-4 w-4" />Agregar objetivo</Button>
        </div>

        {productos.length === 0 && <p className="rounded-md bg-muted p-3 text-sm">No hay productos activos disponibles.</p>}

        <div className="space-y-3">
          {fields.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(220px,1fr)_140px_auto] md:items-start">
              <Controller name={`productosObjetivo.${index}.productoId`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Producto</FieldLabel>
                  <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona producto" /></SelectTrigger><SelectContent>{productos.map((producto) => <SelectItem key={producto.id} value={producto.id}>{producto.nombre}</SelectItem>)}</SelectContent></Select></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Controller name={`productosObjetivo.${index}.cantidadObjetivo`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cantidad objetivo</FieldLabel>
                  <FieldContent><Input type="number" min="1" step="1" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : 1} /></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Button type="button" variant="outline" className="mt-0 md:mt-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/tareas")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
