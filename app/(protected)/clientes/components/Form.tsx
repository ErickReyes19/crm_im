"use client";

import { InlineNotaSection, type NotaEvidencia } from "@/app/(protected)/components/inline-nota-section";
import { defaultTareaInlineValues, InlineTareaSection, type TareaInlineValues } from "@/app/(protected)/components/inline-tarea-section";
import { createNota } from "@/app/(protected)/notas/actions";
import { createTarea } from "@/app/(protected)/tareas/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCliente, updateCliente } from "../actions";
import { ClienteFormValues, ClienteSchema } from "../schema";

type ClienteFormOutput = z.output<typeof ClienteSchema>;

export function Formulario({
  isUpdate,
  initialData,
  canCreateNota = false,
  canCreateTarea = false,
}: {
  isUpdate: boolean;
  initialData?: ClienteFormValues;
  canCreateNota?: boolean;
  canCreateTarea?: boolean;
}) {
  const router = useRouter();
  const form = useForm<ClienteFormValues, unknown, ClienteFormOutput>({
    resolver: zodResolver(ClienteSchema),
    defaultValues: initialData,
  });

  const [agregarNota, setAgregarNota] = useState(false);
  const [agregarTarea, setAgregarTarea] = useState(false);
  const [notaContenido, setNotaContenido] = useState("");
  const [notaEvidencias, setNotaEvidencias] = useState<NotaEvidencia[]>([]);
  const [tareaValues, setTareaValues] = useState<TareaInlineValues>(defaultTareaInlineValues);

  async function onSubmit(data: ClienteFormOutput) {
    try {
      if (isUpdate) {
        await updateCliente(data);
        toast.success("Cliente actualizado.");
        router.push("/clientes");
        router.refresh();
        return;
      }

      if (agregarTarea && !tareaValues.titulo.trim()) {
        toast.error("Si agregas una tarea, el título es requerido.");
        return;
      }

      if (agregarNota && !notaContenido.trim() && !agregarTarea) {
        toast.error("Si agregas una nota, el contenido es requerido.");
        return;
      }

      const cliente = await createCliente(data);
      let notaId: string | undefined;

      if (agregarNota && notaContenido.trim()) {
        const nota = await createNota({
          clienteId: cliente.id,
          contenido: notaContenido.trim(),
          evidencias: notaEvidencias,
        });
        notaId = nota.id;
      }

      if (agregarTarea && tareaValues.titulo.trim()) {
        if (!notaId) {
          const nota = await createNota({
            clienteId: cliente.id,
            contenido: notaContenido.trim() || `Seguimiento: ${tareaValues.titulo.trim()}`,
            evidencias: [],
          });
          notaId = nota.id;
        }

        await createTarea({
          notaId,
          titulo: tareaValues.titulo.trim(),
          descripcion: tareaValues.descripcion.trim() || undefined,
          fechaObjetivo: tareaValues.fechaObjetivo,
          estado: tareaValues.estado,
        });
      }

      const extras: string[] = [];
      if (agregarNota && notaContenido.trim()) extras.push("nota");
      if (agregarTarea && tareaValues.titulo.trim()) extras.push("tarea");

      toast.success(
        extras.length > 0
          ? `Cliente creado con ${extras.join(" y ")}.`
          : "Cliente creado y asignado a tu usuario.",
      );
      router.push(`/clientes/${cliente.id}/profile`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hubo un problema al guardar.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Controller
          name="nombre"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-sm">
              <FieldLabel>Nombre</FieldLabel>
              <FieldContent>
                <Input placeholder="Ej. Laura" autoComplete="given-name" {...field} value={field.value ?? ""} />
              </FieldContent>
              <FieldDescription>Nombre principal del cliente.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="apellido"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-sm">
              <FieldLabel>Apellido</FieldLabel>
              <FieldContent>
                <Input placeholder="Ej. Pérez" autoComplete="family-name" {...field} value={field.value ?? ""} />
              </FieldContent>
              <FieldDescription>Apellido o razón comercial corta.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="ciudad"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-xs">
              <FieldLabel>Ciudad</FieldLabel>
              <FieldContent>
                <Input placeholder="Ej. San Pedro Sula" autoComplete="address-level2" {...field} value={field.value ?? ""} />
              </FieldContent>
              <FieldDescription>Ubicación principal.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="numero"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-xs">
              <FieldLabel>Teléfono</FieldLabel>
              <FieldContent>
                <Input type="tel" placeholder="+50488998800" autoComplete="tel" {...field} value={field.value ?? ""} />
              </FieldContent>
              <FieldDescription>Número de contacto preferido.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="etiqueta"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-xs">
              <FieldLabel>Etiqueta</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUEVO">Nuevo</SelectItem>
                    <SelectItem value="INTERESADO">Interesado</SelectItem>
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                    <SelectItem value="MAYORISTA">Mayorista</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>Estado comercial inicial.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {isUpdate && (
        <Controller
          name="activo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="max-w-xs">
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select value={field.value ? "true" : "false"} onValueChange={(value) => field.onChange(value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>La asignación del cliente se administra en Clientes / Asignaciones.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {!isUpdate && (canCreateNota || canCreateTarea) && (
        <div className="space-y-4 border-t pt-5">
          <p className="text-sm font-medium">Seguimiento inicial (opcional)</p>
          {canCreateNota && (
            <InlineNotaSection
              enabled={agregarNota}
              onEnabledChange={setAgregarNota}
              contenido={notaContenido}
              onContenidoChange={setNotaContenido}
              evidencias={notaEvidencias}
              onEvidenciasChange={setNotaEvidencias}
              disabled={form.formState.isSubmitting}
            />
          )}
          {canCreateTarea && (
            <InlineTareaSection
              enabled={agregarTarea}
              onEnabledChange={setAgregarTarea}
              values={tareaValues}
              onChange={setTareaValues}
              disabled={form.formState.isSubmitting}
              description="La tarea se vinculará a la nota que crees aquí. Si no agregas nota, se creará una automáticamente."
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
