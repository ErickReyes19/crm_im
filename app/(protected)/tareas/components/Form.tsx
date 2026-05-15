"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, updateTarea } from "../actions";
import { Tarea, TareaSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Formulario({ isUpdate, initialData, usuarios }: { isUpdate: boolean; initialData?: z.infer<typeof TareaSchema>; usuarios: Array<{ id: string; usuario: string }>; }) {
    const router = useRouter(); const form = useForm<z.infer<typeof TareaSchema>>({ resolver: zodResolver(TareaSchema), defaultValues: initialData });
    async function onSubmit(data: z.infer<typeof TareaSchema>) { try { if (isUpdate) { await updateTarea(data as Tarea); toast.success("Tarea actualizada."); } else { await createTarea(data as Tarea); toast.success("Tarea creada."); } router.push('/tareas'); router.refresh(); } catch { toast.error('Error al guardar.'); } }
    return <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 border rounded-md p-4">
        <Controller name="nombre" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nombre</FieldLabel><FieldContent><Input {...field} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
        <Controller name="descripcion" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Descripción</FieldLabel><FieldContent><Input {...field} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
        <Controller name="fechaFinalizacion" control={form.control} render={({ field }) => <Field><FieldLabel>Fecha finalización</FieldLabel><FieldContent><Input type="date" value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(new Date(e.target.value))} /></FieldContent></Field>} />
        <Controller name="estado" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="EN_PROGRESO">En progreso</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select></FieldContent></Field>} />
        <Controller name="asignadoAId" control={form.control} render={({ field }) => <Field><FieldLabel>Asignado a</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{usuarios.map(u => <SelectItem key={u.id} value={u.id}>{u.usuario}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
        <Controller name="asignadoPorId" control={form.control} render={({ field }) => <Field><FieldLabel>Asignado por</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{usuarios.map(u => <SelectItem key={u.id} value={u.id}>{u.usuario}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
        <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? 'Actualizar' : 'Crear'}</Button></div></form>;
}
