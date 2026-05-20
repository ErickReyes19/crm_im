"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, updateTarea } from "../actions";
import { TareaFormValues, TareaSchema } from "../schema";

type TareaFormOutput = z.output<typeof TareaSchema>;

export function Formulario({ notas, initialData, isUpdate = false }: { notas: Array<{ id: string; contenido: string; cliente: { nombre: string; apellido: string } }>; initialData?: Partial<TareaFormOutput>; isUpdate?: boolean }) {
  const router = useRouter();
  const form = useForm<TareaFormValues, unknown, TareaFormOutput>({
    resolver: zodResolver(TareaSchema),
    defaultValues: {
      id: initialData?.id,
      notaId: initialData?.notaId ?? "",
      titulo: initialData?.titulo ?? "",
      descripcion: initialData?.descripcion ?? "",
      fechaObjetivo: initialData?.fechaObjetivo ?? new Date(),
      estado: initialData?.estado ?? "PENDIENTE",
    },
  });

  async function onSubmit(data: TareaFormOutput) {
    try {
      if (isUpdate) await updateTarea(data);
      else await createTarea(data);
      toast.success(isUpdate ? "Tarea actualizada" : "Tarea creada");
      router.push("/tareas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    <Controller name="notaId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nota relacionada</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona una nota" /></SelectTrigger><SelectContent>{notas.map((n) => <SelectItem key={n.id} value={n.id}>{n.cliente.nombre} {n.cliente.apellido} - {n.contenido.slice(0, 40)}</SelectItem>)}</SelectContent></Select></FieldContent><FieldDescription>La tarea se amarra a una nota, y la nota al cliente.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="titulo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Título</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="descripcion" control={form.control} render={({ field }) => <Field><FieldLabel>Descripción</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent></Field>} />
    <Controller name="fechaObjetivo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Fecha de la tarea</FieldLabel><FieldContent><Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0,10) : ""} onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="estado" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="EN_PROGRESO">En progreso</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select></FieldContent></Field>} />
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push('/tareas')}>Cancelar</Button><Button type="submit">Guardar</Button></div>
  </form>;
}
