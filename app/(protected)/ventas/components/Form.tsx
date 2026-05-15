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
import { createVenta, updateVenta } from "../actions";
import { VentaFormValues, VentaSchema } from "../schema";

type VentaFormOutput = z.output<typeof VentaSchema>;
type ClienteOpcion = { id: string; nombre: string; apellido: string };
type UsuarioOpcion = { id: string; usuario: string };

export function Formulario({ isUpdate, initialData, clientes, usuarios }: { isUpdate: boolean; initialData?: VentaFormValues; clientes: ClienteOpcion[]; usuarios: UsuarioOpcion[] }) {
  const router = useRouter();
  const form = useForm<VentaFormValues, unknown, VentaFormOutput>({ resolver: zodResolver(VentaSchema), defaultValues: initialData });

  async function onSubmit(data: VentaFormOutput) {
    try {
      if (isUpdate) {
        await updateVenta(data);
        toast.success("Venta actualizada.");
      } else {
        await createVenta(data);
        toast.success("Venta creada.");
      }
      router.push("/ventas");
      router.refresh();
    } catch {
      toast.error("Error al guardar.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-sm">
            <FieldLabel>Cliente</FieldLabel>
            <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona cliente" /></SelectTrigger><SelectContent>{clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</SelectItem>)}</SelectContent></Select></FieldContent>
            <FieldDescription>Cliente asociado a la venta.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="usuarioId" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-sm">
            <FieldLabel>Usuario</FieldLabel>
            <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger><SelectContent>{usuarios.map((usuario) => <SelectItem key={usuario.id} value={usuario.id}>{usuario.usuario}</SelectItem>)}</SelectContent></Select></FieldContent>
            <FieldDescription>Responsable de la venta.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="total" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-[220px]">
            <FieldLabel>Total</FieldLabel>
            <FieldContent><Input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""} /></FieldContent>
            <FieldDescription>Monto en formato decimal.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="estado" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-[240px]">
            <FieldLabel>Estado</FieldLabel>
            <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona estado" /></SelectTrigger><SelectContent><SelectItem value="PROCESO">Proceso</SelectItem><SelectItem value="ENVIO">Envío</SelectItem><SelectItem value="ENTREGADA">Entregada</SelectItem></SelectContent></Select></FieldContent>
            <FieldDescription>Etapa logística o comercial.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/ventas")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
