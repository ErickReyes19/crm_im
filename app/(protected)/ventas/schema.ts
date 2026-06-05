import { z } from "zod";

export const TipoPrecioVentaSchema = z.enum(["NORMAL", "DESCUENTO_10", "DESCUENTO_20", "DESCUENTO_30", "DESCUENTO_15"]);
export const MetodoPagoVentaSchema = z.enum(["EFECTIVO", "TRANSFERENCIA"]);

export const VentaProductoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  cantidad: z.coerce.number().int("La cantidad debe ser entera").min(1, "La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().min(0, "El precio no puede ser negativo"),
  tipoPrecio: TipoPrecioVentaSchema.default("NORMAL"),
});

export const VentaSchema = z.object({
  id: z.string().optional(),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  total: z.coerce.number().min(0, "El total no puede ser negativo").optional(),
  estado: z.enum(["PROCESO", "ENVIO", "ENTREGADA"]),
  metodoPago: MetodoPagoVentaSchema.default("EFECTIVO"),
  evidenciaTransferenciaUbicacion: z.string().optional().nullable(),
  evidenciaTransferenciaNombre: z.string().optional().nullable(),
  productos: z.array(VentaProductoSchema).min(1, "Agrega al menos un producto"),
}).superRefine((data, ctx) => {
  if (data.metodoPago === "TRANSFERENCIA" && !data.evidenciaTransferenciaUbicacion) {
    ctx.addIssue({
      code: "custom",
      path: ["evidenciaTransferenciaUbicacion"],
      message: "Debes subir una evidencia cuando el pago es por transferencia",
    });
  }
});

export type Venta = z.output<typeof VentaSchema>;
export type VentaFormValues = z.input<typeof VentaSchema>;
export type TipoPrecioVenta = z.infer<typeof TipoPrecioVentaSchema>;
export type MetodoPagoVenta = z.infer<typeof MetodoPagoVentaSchema>;
