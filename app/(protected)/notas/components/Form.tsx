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
import { createNota, updateNota } from "../actions";
import { NotaFormValues, NotaSchema } from "../schema";

type NotaFormOutput = z.output<typeof NotaSchema>;

export function Formulario({ clientes, initialData, isUpdate = false }: { clientes: Array<{ id: string; nombre: string; apellido: string }>; initialData?: Partial<NotaFormOutput>; isUpdate?: boolean }) {
  const router = useRouter();
  const form = useForm<NotaFormValues, unknown, NotaFormOutput>({
    resolver: zodResolver(NotaSchema),
    defaultValues: { id: initialData?.id, clienteId: initialData?.clienteId ?? "", contenido: initialData?.contenido ?? "", evidencias: initialData?.evidencias ?? [] },
  });

  async function onSubmit(data: NotaFormOutput) {
    try {
      if (isUpdate) await updateNota(data);
      else await createNota(data);
      toast.success(isUpdate ? "Nota actualizada." : "Nota creada.");
      router.push("/notas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const convert = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const nuevas = await Promise.all(Array.from(files).map(convert));
    form.setValue("evidencias", [...(form.getValues("evidencias") ?? []), ...nuevas], { shouldValidate: true });
  }

  const evidencias = form.watch("evidencias") ?? [];

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}><FieldLabel>Cliente</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange} disabled={isUpdate}><SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger><SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
    )} />

    <Controller name="contenido" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}><FieldLabel>Nota</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
    )} />

    <Field><FieldLabel>Evidencias (imágenes)</FieldLabel><FieldContent><Input type="file" multiple accept="image/*" onChange={(e) => onFilesSelected(e.target.files)} /></FieldContent></Field>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{evidencias.map((img, i) => <img key={i} src={img} alt={`Evidencia ${i + 1}`} className="h-24 w-full rounded border object-cover" />)}</div>

    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/notas")}>Cancelar</Button><Button type="submit">Guardar</Button></div>
  </form>;
}
