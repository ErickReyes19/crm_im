"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createVenta, updateVenta } from "../actions";
import { VentaFormValues, VentaSchema } from "../schema";

type VentaFormOutput = z.output<typeof VentaSchema>;
type ClienteOpcion = { id: string; nombre: string; apellido: string };
type ProductoOpcion = { id: string; nombre: string; precio: number };

function calcularTotal(items: Array<{ productoId?: string; cantidad?: number | string }> | undefined, productos: ProductoOpcion[]) {
  return (items ?? []).reduce((total, item) => {
    const producto = productos.find((opcion) => opcion.id === item.productoId);
    const cantidad = Number(item.cantidad ?? 0);
    return total + (producto?.precio ?? 0) * (Number.isFinite(cantidad) ? cantidad : 0);
  }, 0);
}

export function Formulario({ isUpdate, initialData, clientes, productos }: { isUpdate: boolean; initialData?: VentaFormValues; clientes: ClienteOpcion[]; productos: ProductoOpcion[] }) {
  const router = useRouter();
  const form = useForm<VentaFormValues, unknown, VentaFormOutput>({ resolver: zodResolver(VentaSchema), defaultValues: initialData });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "productos" });
  const productosSeleccionados = useWatch({ control: form.control, name: "productos" });
  const total = calcularTotal(productosSeleccionados as Array<{ productoId?: string; cantidad?: string | number }> | undefined, productos);

  async function onSubmit(data: VentaFormOutput) {
    try {
      const payload = { ...data, total };
      if (isUpdate) {
        await updateVenta(payload);
        toast.success("Venta actualizada.");
      } else {
        await createVenta(payload);
        toast.success("Venta creada.");
      }
      router.push("/ventas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Controller name="clienteId" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-sm">
            <FieldLabel>Cliente asignado</FieldLabel>
            <FieldContent>
              <Select value={field.value} onValueChange={field.onChange} disabled={clientes.length === 0}>
                <SelectTrigger><SelectValue placeholder={clientes.length === 0 ? "No tienes clientes asignados" : "Selecciona cliente"} /></SelectTrigger>
                <SelectContent>{clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</SelectItem>)}</SelectContent>
              </Select>
            </FieldContent>
            <FieldDescription>Solo aparecen los clientes asignados a tu usuario.</FieldDescription>
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

        <Field className="max-w-[240px]">
          <FieldLabel>Total de la venta</FieldLabel>
          <FieldContent><Input readOnly value={total.toLocaleString("es-DO", { style: "currency", currency: "HNL" })} /></FieldContent>
          <FieldDescription>Se calcula según productos y cantidades.</FieldDescription>
        </Field>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Productos vendidos</h3>
            <p className="text-sm text-muted-foreground">Selecciona qué productos se vendieron y la cantidad.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => append({ productoId: productos[0]?.id ?? "", cantidad: 1 })} disabled={productos.length === 0}><Plus className="mr-2 h-4 w-4" />Agregar producto</Button>
        </div>

        {productos.length === 0 && <p className="rounded-md bg-muted p-3 text-sm">No hay productos activos disponibles.</p>}

        <div className="space-y-3">
          {fields.map((item, index) => {
            const seleccionado = productos.find((producto) => producto.id === productosSeleccionados?.[index]?.productoId);
            const cantidad = Number(productosSeleccionados?.[index]?.cantidad ?? 0);
            const subtotal = (seleccionado?.precio ?? 0) * (Number.isFinite(cantidad) ? cantidad : 0);

            return <div key={item.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(220px,1fr)_120px_160px_auto] md:items-start">
              <Controller name={`productos.${index}.productoId`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Producto</FieldLabel>
                  <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona producto" /></SelectTrigger><SelectContent>{productos.map((producto) => <SelectItem key={producto.id} value={producto.id}>{producto.nombre} - {producto.precio.toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</SelectItem>)}</SelectContent></Select></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Controller name={`productos.${index}.cantidad`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cantidad</FieldLabel>
                  <FieldContent><Input type="number" min="1" step="1" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : 1} /></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Field>
                <FieldLabel>Subtotal</FieldLabel>
                <FieldContent><Input readOnly value={subtotal.toLocaleString("es-DO", { style: "currency", currency: "HNL" })} /></FieldContent>
              </Field>

              <Button type="button" variant="outline" className="mt-0 md:mt-7" onClick={() => remove(index)} disabled={fields.length === 1}><Trash2 className="h-4 w-4" /></Button>
            </div>;
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push("/ventas")}>Cancelar</Button>
        <Button type="submit" disabled={form.formState.isSubmitting || clientes.length === 0 || productos.length === 0}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
