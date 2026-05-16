"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createProducto, updateProducto } from "../actions";
import { ProductoFormValues, ProductoSchema } from "../schema";

type ProductoFormOutput = z.output<typeof ProductoSchema>;

export function Formulario({ isUpdate, initialData }: { isUpdate: boolean; initialData?: ProductoFormValues }) {
  const router = useRouter();
  const form = useForm<ProductoFormValues, unknown, ProductoFormOutput>({
    resolver: zodResolver(ProductoSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: ProductoFormOutput) {
    try {
      if (isUpdate) {
        await updateProducto(data);
        toast.success("Producto actualizado.");
      } else {
        await createProducto(data);
        toast.success("Producto creado.");
      }
      router.push("/productos");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(260px,420px)_minmax(160px,220px)_minmax(120px,160px)]">
        <Controller name="nombre" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <FieldContent><Input placeholder="Ej. Plan mensual" {...field} value={field.value ?? ""} /></FieldContent>
            <FieldDescription>Nombre comercial del producto.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="precio" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Precio</FieldLabel>
            <FieldContent><Input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""} /></FieldContent>
            <FieldDescription>Precio unitario de venta.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="activo" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="justify-start">
            <FieldLabel>Activo</FieldLabel>
            <FieldContent><Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} /></FieldContent>
            <FieldDescription>Disponible para ventas y tareas.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </div>

      <Controller name="descripcion" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="max-w-3xl">
          <FieldLabel>Descripción</FieldLabel>
          <FieldContent><Textarea rows={4} placeholder="Describe el producto" {...field} value={field.value ?? ""} /></FieldContent>
          <FieldDescription>Detalle funcional o comercial del producto.</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/productos")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
