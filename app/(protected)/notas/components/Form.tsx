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
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createNota, updateNota } from "../actions";
import { NotaFormValues, NotaSchema } from "../schema";

type NotaFormOutput = z.output<typeof NotaSchema>;
type NotaFormValuesWithUsuario = NotaFormValues & { usuarioId?: string };
type UploadedImage = NotaFormOutput["evidencias"][number] & { url?: string };
type ClienteOption = { id: string; nombre: string; apellido: string; usuarioAsignadoId: string };
type UsuarioOption = { id: string; usuario: string; nombre?: string | null };

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

export function Formulario({ clientes, usuarios, currentUserId, initialData, isUpdate = false }: { clientes: ClienteOption[]; usuarios: UsuarioOption[]; currentUserId: string; initialData?: Partial<NotaFormOutput>; isUpdate?: boolean }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clienteInicial = clientes.find((cliente) => cliente.id === initialData?.clienteId);
  const defaultUsuarioId = clienteInicial?.usuarioAsignadoId ?? currentUserId ?? (usuarios.length === 1 ? usuarios[0].id : "");
  const form = useForm<NotaFormValuesWithUsuario, unknown, NotaFormOutput>({
    resolver: zodResolver(NotaSchema),
    defaultValues: {
      id: initialData?.id,
      usuarioId: defaultUsuarioId,
      clienteId: initialData?.clienteId ?? "",
      contenido: initialData?.contenido ?? "",
      evidencias: initialData?.evidencias ?? [],
    },
  });

  const showUsuarioSelect = usuarios.length > 1;
  const selectedUsuarioId = useWatch({ control: form.control, name: "usuarioId" }) ?? defaultUsuarioId;
  const clientesFiltrados = selectedUsuarioId ? clientes.filter((cliente) => cliente.usuarioAsignadoId === selectedUsuarioId) : [];

  useEffect(() => {
    const currentClienteId = form.getValues("clienteId");
    if (!selectedUsuarioId || !currentClienteId) return;
    const currentCliente = clientes.find((cliente) => cliente.id === currentClienteId);
    if (currentCliente?.usuarioAsignadoId !== selectedUsuarioId) {
      form.setValue("clienteId", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [selectedUsuarioId, clientes, form]);

  async function onSubmit(data: NotaFormValuesWithUsuario) {
    if (isSaving || isUploading) return;

    const notaData = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "usuarioId")) as NotaFormOutput;
    setIsSaving(true);
    try {
      if (isUpdate) await updateNota(notaData);
      else await createNota(notaData);
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

  async function removeEvidencia(index: number) {
    const evidencias = form.getValues("evidencias") ?? [];
    const evidencia = evidencias[index];
    if (!evidencia?.ubicacion) {
      form.setValue("evidencias", evidencias.filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true, shouldDirty: true });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/uploads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: evidencia.ubicacion }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo eliminar la evidencia.");
      form.setValue("evidencias", evidencias.filter((_, itemIndex) => itemIndex !== index), { shouldValidate: true, shouldDirty: true });
      toast.success("Evidencia eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la evidencia.");
    } finally {
      setIsDeleting(false);
    }
  }

  const evidencias = useWatch({ control: form.control, name: "evidencias" }) ?? [];

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    {showUsuarioSelect && (
      <Controller name="usuarioId" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>Usuario</FieldLabel>
          <FieldContent>
            <Select value={field.value} onValueChange={field.onChange} disabled={isUpdate || usuarios.length === 0}>
              <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>{usuario.nombre?.trim() ? `${usuario.nombre} (${usuario.usuario})` : usuario.usuario}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />)}
    <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Cliente</FieldLabel>
        <FieldContent>
          <Select value={field.value} onValueChange={field.onChange} disabled={isUpdate || (usuarios.length > 1 && !selectedUsuarioId)}>
            <SelectTrigger><SelectValue placeholder={usuarios.length > 1 ? "Selecciona usuario primero" : "Selecciona cliente"} /></SelectTrigger>
            <SelectContent>
              {clientesFiltrados.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldContent>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )} />

    <Controller name="contenido" control={form.control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}><FieldLabel>Nota</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
    )} />

    <Field><FieldLabel>Evidencias (imágenes)</FieldLabel><FieldContent><Input type="file" multiple accept="image/*" onChange={(e) => onFilesSelected(e.target.files)} disabled={isUploading || isDeleting} /></FieldContent></Field>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {evidencias.map((img, i) => (
        <div key={`${img.ubicacion}-${i}`} className="relative overflow-hidden rounded border">
          <img src={mediaUrl(img.ubicacion)} alt={img.nombre || `Evidencia ${i + 1}`} className="h-24 w-full object-cover" />
          <Button type="button" variant="outline" size="icon" className="absolute right-1 top-1 h-7 w-7 bg-background/90" onClick={() => removeEvidencia(i)} disabled={isDeleting}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>

    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/notas")}>Cancelar</Button><Button type="submit" disabled={isSaving || isUploading || form.formState.isSubmitting}>{isSaving || form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUploading ? "Subiendo..." : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
