/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createNota, updateNota } from "../actions";
import { NotaFormValues, NotaSchema } from "../schema";

type NotaFormOutput = z.output<typeof NotaSchema>;
type UploadedImage = NotaFormOutput["evidencias"][number] & { url?: string };

function mediaUrl(ubicacion: string) {
  return `/api/media/${ubicacion}`;
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/notas", { method: "POST", body: formData });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo subir la evidencia.");
  return payload as UploadedImage;
}

export function Formulario({ clientes, initialData, isUpdate = false }: { clientes: Array<{ id: string; nombre: string; apellido: string }>; initialData?: Partial<NotaFormOutput>; isUpdate?: boolean }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<NotaFormValues, unknown, NotaFormOutput>({
    resolver: zodResolver(NotaSchema),
    defaultValues: { id: initialData?.id, clienteId: initialData?.clienteId ?? "", contenido: initialData?.contenido ?? "", evidencias: initialData?.evidencias ?? [] },
  });

  async function onSubmit(data: NotaFormOutput) {
    if (isSaving || isUploading) return;

    setIsSaving(true);
    try {
      if (isUpdate) await updateNota(data);
      else await createNota(data);
      toast.success(isUpdate ? "Nota actualizada." : "Nota creada.");
      router.push("/notas");
      router.refresh();
    } catch (error) {
      setIsSaving(false);
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    const imagenes = Array.from(files);
    const invalidImage = imagenes.find((file) => !file.type.startsWith("image/"));
    if (invalidImage) {
      toast.error("Todas las evidencias deben ser imágenes.");
      return;
    }

    setIsUploading(true);
    try {
      const nuevas = await Promise.all(imagenes.map(uploadImage));
      form.setValue("evidencias", [...(form.getValues("evidencias") ?? []), ...nuevas.map(({ ubicacion, nombre }) => ({ ubicacion, nombre }))], { shouldValidate: true, shouldDirty: true });
      toast.success("Evidencias subidas a S3.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron subir las evidencias.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeEvidencia(index: number) {
    form.setValue("evidencias", (form.getValues("evidencias") ?? []).filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true, shouldDirty: true });
  }

  const evidencias = useWatch({ control: form.control, name: "evidencias" }) ?? [];

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}><FieldLabel>Cliente</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange} disabled={isUpdate}><SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger><SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
    )} />

    <Controller name="contenido" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}><FieldLabel>Nota</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
    )} />

    <Field><FieldLabel>Evidencias (imágenes)</FieldLabel><FieldContent><Input type="file" multiple accept="image/*" onChange={(e) => onFilesSelected(e.target.files)} disabled={isUploading} /></FieldContent></Field>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{evidencias.map((img, i) => <div key={`${img.ubicacion}-${i}`} className="relative overflow-hidden rounded border"><img src={mediaUrl(img.ubicacion)} alt={img.nombre || `Evidencia ${i + 1}`} className="h-24 w-full object-cover" /><Button type="button" variant="outline" size="icon" className="absolute right-1 top-1 h-7 w-7 bg-background/90" onClick={() => removeEvidencia(i)}><X className="h-4 w-4" /></Button></div>)}</div>

    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/notas")}>Cancelar</Button><Button type="submit" disabled={isSaving || isUploading || form.formState.isSubmitting}>{isSaving || form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUploading ? "Subiendo..." : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
