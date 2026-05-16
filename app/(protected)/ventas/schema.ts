import { z } from "zod";

export const VentaProductoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  cantidad: z.coerce.number().int("La cantidad debe ser entera").min(1, "La cantidad debe ser mayor a 0"),
});

export const VentaSchema = z.object({
  id: z.string().optional(),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  total: z.coerce.number().min(0, "El total no puede ser negativo").optional(),
  estado: z.enum(["PROCESO", "ENVIO", "ENTREGADA"]),
  productos: z.array(VentaProductoSchema).min(1, "Agrega al menos un producto"),
});

export type Venta = z.output<typeof VentaSchema>;
export type VentaFormValues = z.input<typeof VentaSchema>;
