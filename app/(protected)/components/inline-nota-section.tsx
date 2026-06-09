/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type NotaEvidencia = { ubicacion: string; nombre: string };

function mediaUrl(ubicacion: string) {
  return `/api/media/${ubicacion}`;
}

async function uploadImage(file: File): Promise<NotaEvidencia> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/notas", { method: "POST", body: formData });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "No se pudo subir la evidencia.");
  return { ubicacion: payload.ubicacion, nombre: payload.nombre };
}

export function InlineNotaSection({
  enabled,
  onEnabledChange,
  contenido,
  onContenidoChange,
  evidencias,
  onEvidenciasChange,
  disabled = false,
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  contenido: string;
  onContenidoChange: (value: string) => void;
  evidencias: NotaEvidencia[];
  onEvidenciasChange: (value: NotaEvidencia[]) => void;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      onEvidenciasChange([...evidencias, ...nuevas]);
      toast.success("Evidencias subidas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron subir las evidencias.");
    } finally {
      setIsUploading(false);
    }
  }

  async function removeEvidencia(index: number) {
    const evidencia = evidencias[index];
    if (!evidencia?.ubicacion) {
      onEvidenciasChange(evidencias.filter((_, itemIndex) => itemIndex !== index));
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
      onEvidenciasChange(evidencias.filter((_, itemIndex) => itemIndex !== index));
      toast.success("Evidencia eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la evidencia.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border bg-muted/20 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="inline-nota-toggle" className="font-medium">Agregar nota</Label>
        </div>
        <Switch
          id="inline-nota-toggle"
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="space-y-4 border-t pt-4">
          <Field>
            <FieldLabel>Contenido de la nota</FieldLabel>
            <FieldContent>
              <Textarea
                rows={3}
                placeholder="Escribe la nota del cliente..."
                value={contenido}
                onChange={(e) => onContenidoChange(e.target.value)}
                disabled={disabled}
              />
            </FieldContent>
            <FieldDescription>Opcional al crear el cliente, pero requerida si también agregas una tarea.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Evidencias (imágenes)</FieldLabel>
            <FieldContent>
              <Input type="file" multiple accept="image/*" onChange={(e) => onFilesSelected(e.target.files)} disabled={disabled || isUploading || isDeleting} />
            </FieldContent>
          </Field>

          {evidencias.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {evidencias.map((img, i) => (
                <div key={`${img.ubicacion}-${i}`} className="relative overflow-hidden rounded border">
                  <img src={mediaUrl(img.ubicacion)} alt={img.nombre || `Evidencia ${i + 1}`} className="h-24 w-full object-cover" />
                  <Button type="button" variant="outline" size="icon" className="absolute right-1 top-1 h-7 w-7 bg-background/90" onClick={() => removeEvidencia(i)} disabled={disabled || isDeleting}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
