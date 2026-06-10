import { z } from "zod";

export const ProductoSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  stock: z.coerce.number().int("El stock debe ser entero").min(0, "El stock no puede ser negativo").default(0),
  stockMinimo: z.coerce.number().int("El stock mínimo debe ser entero").min(0, "El stock mínimo no puede ser negativo").default(0),
  activo: z.coerce.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.stockMinimo > data.stock) {
    ctx.addIssue({
      code: "custom",
      path: ["stockMinimo"],
      message: "El stock mínimo no puede ser mayor al stock actual",
    });
  }
});

export type Producto = z.output<typeof ProductoSchema>;
export type ProductoFormValues = z.input<typeof ProductoSchema>;

export function getProductoLabel(producto: { nombre: string; descripcion?: string | null }) {
  return producto.descripcion ? `${producto.nombre} - ${producto.descripcion}` : producto.nombre;
}
