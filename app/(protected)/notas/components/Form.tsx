"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createNota } from "../actions";
import { NotaFormValues, NotaSchema } from "../schema";

type NotaFormOutput = z.output<typeof NotaSchema>;

export function Formulario({ clientes }: { clientes: Array<{ id: string; nombre: string; apellido: string }> }) {
  const router = useRouter();
  const form = useForm<NotaFormValues, unknown, NotaFormOutput>({
    resolver: zodResolver(NotaSchema),
    defaultValues: { clienteId: "", contenido: "", evidencia: "" },
  });

  async function onSubmit(data: NotaFormOutput) {
    try {
      await createNota(data);
      toast.success("Nota creada.");
      router.push("/notas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Cliente</FieldLabel>
        <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger><SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></FieldContent>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )} />

    <Controller name="contenido" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Nota</FieldLabel>
        <FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )} />

    <Controller name="evidencia" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Evidencia (base64)</FieldLabel>
        <FieldContent><Input {...field} value={field.value ?? ""} placeholder="data:image/png;base64,..." /></FieldContent>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )} />

    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/notas")}>Cancelar</Button><Button type="submit">Guardar</Button></div>
  </form>;
}
