"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCliente, updateCliente } from "../actions";
import { ClienteFormValues, ClienteSchema } from "../schema";

type ClienteFormOutput = z.output<typeof ClienteSchema>;

export function Formulario({
  isUpdate,
  initialData,
}: {
  isUpdate: boolean;
  initialData?: ClienteFormValues;
}) {
  const router = useRouter();
  const form = useForm<ClienteFormValues, unknown, ClienteFormOutput>({
    resolver: zodResolver(ClienteSchema),
    defaultValues: initialData,
  });

  console.log("Form values:", form.getValues()); // Depuración de valores del formulario
  async function onSubmit(data: ClienteFormOutput) {
    try {
      if (isUpdate) {
        await updateCliente(data);
        toast.success("Cliente actualizado.");
      } else {
        await createCliente(data);
        toast.success("Cliente creado y asignado a tu usuario.");
      }
      router.push("/clientes");
      router.refresh();
    } catch {
      toast.error("Hubo un problema al guardar.");
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

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
