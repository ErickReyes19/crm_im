import { z } from "zod";

export const ProductoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  precio: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  activo: z.coerce.boolean().default(true),
});

export type Producto = z.output<typeof ProductoSchema>;
export type ProductoFormValues = z.input<typeof ProductoSchema>;
