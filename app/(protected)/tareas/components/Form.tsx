"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
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
type ClienteOpcion = { id: string; nombre: string; apellido: string };

export function Formulario({ isUpdate, initialData, usuarios, clientes }: { isUpdate: boolean; initialData?: TareaFormValues; usuarios: UsuarioOpcion[]; clientes: ClienteOpcion[] }) {
  const router = useRouter();
  const form = useForm<TareaFormValues, unknown, TareaFormOutput>({ resolver: zodResolver(TareaSchema), defaultValues: initialData });
  async function onSubmit(data: TareaFormOutput) {
    try { if (isUpdate) await updateTarea(data); else await createTarea(data); toast.success("Tarea guardada."); router.push("/tareas"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Error al guardar."); }
  }
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4">
    <Controller name="descripcion" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Descripción</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="fechaFinalizacion" control={form.control} render={({ field }) => <Field><FieldLabel>Fecha</FieldLabel><FieldContent><Input type="date" value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} onChange={(e) => field.onChange(e.target.value)} /></FieldContent></Field>} />
    <Controller name="clienteId" control={form.control} render={({ field }) => <Field><FieldLabel>Cliente</FieldLabel><FieldContent><Select value={field.value ?? ""} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger><SelectContent>{clientes.map((c)=><SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
    <Controller name="asignadoAId" control={form.control} render={({ field }) => <Field><FieldLabel>Asignado a</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{usuarios.map((u)=><SelectItem key={u.id} value={u.id}>{u.usuario}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
    <Controller name="estado" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select></FieldContent></Field>} />
    <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar"}</Button>
  </form>;
}
