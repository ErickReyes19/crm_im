"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { createVenta, updateVenta } from "../actions";
import { TipoPrecioVenta, VentaFormValues, VentaSchema } from "../schema";

type VentaFormOutput = z.output<typeof VentaSchema>;
type ClienteOpcion = { id: string; nombre: string; apellido: string };
type ProductoOpcion = { id: string; nombre: string; descripcion: string };

const descuentos: Array<{ value: TipoPrecioVenta; label: string }> = [
  { value: "NORMAL", label: "Normal" },
  { value: "DESCUENTO_10", label: "Descuento 10%" },
  { value: "DESCUENTO_15", label: "Descuento 15%" },
  { value: "DESCUENTO_20", label: "Descuento 20%" },
  { value: "DESCUENTO_30", label: "Descuento 30%" },
];

function getPrecioConDescuento(precioUnitario: number, tipoPrecio: TipoPrecioVenta) {
  if (tipoPrecio === "DESCUENTO_10") return precioUnitario * 0.9;
  if (tipoPrecio === "DESCUENTO_15") return precioUnitario * 0.85;
  if (tipoPrecio === "DESCUENTO_20") return precioUnitario * 0.8;
  if (tipoPrecio === "DESCUENTO_30") return precioUnitario * 0.7;
  return precioUnitario;
}

function calcularTotal(items: Array<{ cantidad?: number | string; precioUnitario?: number | string; tipoPrecio?: TipoPrecioVenta }> | undefined) {
  return (items ?? []).reduce((total, item) => {
    const cantidad = Number(item.cantidad ?? 0);
    const precioUnitario = Number(item.precioUnitario ?? 0);
    const tipoPrecio = item.tipoPrecio ?? "NORMAL";
    const precioAjustado = getPrecioConDescuento(Number.isFinite(precioUnitario) ? precioUnitario : 0, tipoPrecio);
    return total + precioAjustado * (Number.isFinite(cantidad) ? cantidad : 0);
  }, 0);
}

type UploadedImage = { ubicacion: string; nombre: string; url?: string };

async function uploadImage(file: File, folder: "ventas") {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/uploads/${folder}`, { method: "POST", body: formData });
  let payload: any = {};
  try {
    payload = await response.json();
  } catch {
    const text = await response.text().catch(() => "");
    payload = { error: text };
  }

  if (!response.ok) throw new Error(typeof payload.error === "string" && payload.error ? payload.error : "No se pudo subir la evidencia.");
  return payload as UploadedImage;
}

export function Formulario({ isUpdate, initialData, clientes, productos }: { isUpdate: boolean; initialData?: VentaFormValues; clientes: ClienteOpcion[]; productos: ProductoOpcion[] }) {
  const router = useRouter();
  const form = useForm<VentaFormValues, unknown, VentaFormOutput>({ resolver: zodResolver(VentaSchema), defaultValues: initialData });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "productos" });
  const productosSeleccionados = useWatch({ control: form.control, name: "productos" });
  const metodoPago = useWatch({ control: form.control, name: "metodoPago" });
  const evidenciaTransferencia = useWatch({ control: form.control, name: "evidenciaTransferenciaUbicacion" });
  const totalCalculado = calcularTotal(productosSeleccionados as Array<{ cantidad?: string | number; precioUnitario?: string | number; tipoPrecio?: TipoPrecioVenta }> | undefined);
  const [cargandoEvidencia, setCargandoEvidencia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productoSearch, setProductoSearch] = useState<Record<string, string>>({});

  useEffect(() => {
    form.setValue("total", Number(totalCalculado.toFixed(2)), { shouldValidate: true });
  }, [totalCalculado, form]);

  async function onSubmit(data: VentaFormOutput) {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const payload = { ...data, total: Number(totalCalculado.toFixed(2)) };
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
      setIsSaving(false);
      toast.error(error instanceof Error ? error.message : "Error al guardar.");
    }
  }

  async function handleEvidenciaChange(file?: File) {
    if (!file) {
      form.setValue("evidenciaTransferenciaUbicacion", "", { shouldValidate: true });
      form.setValue("evidenciaTransferenciaNombre", "", { shouldValidate: true });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("La evidencia debe ser una imagen.");
      return;
    }

    setCargandoEvidencia(true);
    try {
      const evidencia = await uploadImage(file, "ventas");
      form.setValue("evidenciaTransferenciaUbicacion", evidencia.ubicacion, { shouldValidate: true, shouldDirty: true });
      form.setValue("evidenciaTransferenciaNombre", evidencia.nombre, { shouldValidate: true, shouldDirty: true });
      toast.success("Evidencia subida a S3.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la evidencia.");
    } finally {
      setCargandoEvidencia(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

        <Controller name="metodoPago" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="max-w-[260px]">
            <FieldLabel>Método de pago</FieldLabel>
            <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EFECTIVO">Efectivo</SelectItem><SelectItem value="TRANSFERENCIA">Transferencia</SelectItem></SelectContent></Select></FieldContent>
            <FieldDescription>Indica cómo se recibió el pago.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Field className="max-w-[260px]">
          <FieldLabel>Total de la venta</FieldLabel>
          <FieldContent><Input readOnly value={totalCalculado.toFixed(2)} /></FieldContent>
          <FieldDescription>Suma automática de todos los productos y descuentos.</FieldDescription>
        </Field>
      </div>

      {metodoPago === "TRANSFERENCIA" && (
        <Field data-invalid={Boolean(form.formState.errors.evidenciaTransferenciaUbicacion)} className="rounded-lg border p-4">
          <FieldLabel>Evidencia de transferencia</FieldLabel>
          <FieldContent><Input type="file" accept="image/*" onChange={(event) => handleEvidenciaChange(event.target.files?.[0])} disabled={cargandoEvidencia} /></FieldContent>
          <FieldDescription>{evidenciaTransferencia ? "Evidencia subida a S3 lista para guardarse." : "Sube una foto o captura de la transferencia."}</FieldDescription>
          {form.formState.errors.evidenciaTransferenciaUbicacion && <FieldError errors={[form.formState.errors.evidenciaTransferenciaUbicacion]} />}
        </Field>
      )}

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Productos vendidos</h3>
            <p className="text-sm text-muted-foreground">Selecciona qué productos se vendieron, la cantidad, precio y descuento.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => append({ productoId: productos[0]?.id ?? "", cantidad: 1, precioUnitario: 0, tipoPrecio: "NORMAL" })} disabled={productos.length === 0}><Plus className="mr-2 h-4 w-4" />Agregar producto</Button>
        </div>

        {productos.length === 0 && <p className="rounded-md bg-muted p-3 text-sm">No hay productos activos disponibles.</p>}

        <div className="space-y-3">
          {fields.map((item, index) => {
            const cantidad = Number(productosSeleccionados?.[index]?.cantidad ?? 0);
            const precioUnitario = Number(productosSeleccionados?.[index]?.precioUnitario ?? 0);
            const tipoPrecio = (productosSeleccionados?.[index]?.tipoPrecio ?? "NORMAL") as TipoPrecioVenta;
            const precioAjustado = getPrecioConDescuento(Number.isFinite(precioUnitario) ? precioUnitario : 0, tipoPrecio);
            const subtotal = precioAjustado * (Number.isFinite(cantidad) ? cantidad : 0);

            return <div key={item.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(220px,1fr)_120px_140px_170px_160px_auto] md:items-start">
              <Controller name={`productos.${index}.productoId`} control={form.control} render={({ field, fieldState }) => {
                const selectedProduct = productos.find((producto) => producto.id === field.value);
                const selectedLabel = selectedProduct ? `${selectedProduct.nombre} - ${selectedProduct.descripcion}` : "";
                const query = productoSearch[item.id] ?? "";
                const filteredProducts = productos.filter((producto) =>
                  `${producto.nombre} ${producto.descripcion}`.toLowerCase().includes(query.toLowerCase())
                );

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Producto</FieldLabel>
                    <FieldContent>
                      <Combobox
                        value={field.value ?? ""}
                        inputValue={query || selectedLabel}
                        onValueChange={(value) => {
                          field.onChange(value ?? "");
                          setProductoSearch((prev) => ({ ...prev, [item.id]: "" }));
                        }}
                        itemToStringLabel={(value) => {
                          const producto = productos.find((producto) => producto.id === value);
                          return producto ? `${producto.nombre} - ${producto.descripcion}` : value;
                        }}
                        itemToStringValue={(value) => value}
                        autoHighlight
                        autoComplete="list"
                        onInputValueChange={(value) => setProductoSearch((prev) => ({ ...prev, [item.id]: value ?? "" }))}
                      >
                        <ComboboxInput
                          placeholder="Buscar producto"
                          showClear
                          showTrigger
                          disabled={productos.length === 0}
                        />
                        <ComboboxContent>
                          <ComboboxList>
                            {filteredProducts.map((producto) => (
                              <ComboboxItem key={producto.id} value={producto.id}>
                                {producto.nombre} - {producto.descripcion}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                          {filteredProducts.length === 0 && (
                            <ComboboxEmpty>No se encontró ningún producto.</ComboboxEmpty>
                          )}
                        </ComboboxContent>
                      </Combobox>
                    </FieldContent>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }} />

              <Controller name={`productos.${index}.cantidad`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Cantidad</FieldLabel>
                  <FieldContent><Input type="number" min="1" step="1" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : 1} /></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Controller name={`productos.${index}.precioUnitario`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Precio unitario</FieldLabel>
                  <FieldContent><Input type="number" min="0" step="0.01" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : 0} /></FieldContent>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />

              <Controller name={`productos.${index}.tipoPrecio`} control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tipo de precio</FieldLabel>
                  <FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{descuentos.map((descuento) => <SelectItem key={descuento.value} value={descuento.value}>{descuento.label}</SelectItem>)}</SelectContent></Select></FieldContent>
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
        <Button type="submit" disabled={isSaving || form.formState.isSubmitting || cargandoEvidencia || clientes.length === 0 || productos.length === 0}>{isSaving || form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
