import { z } from "zod";

export const VentaSchema = z.object({
  id: z.string().optional(),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  usuarioId: z.string().min(1, "Selecciona un usuario"),
  total: z.coerce.number().min(0, "El total no puede ser negativo"),
  estado: z.enum(["PROCESO", "ENVIO", "ENTREGADA"]),
});

export type Venta = z.output<typeof VentaSchema>;
export type VentaFormValues = z.input<typeof VentaSchema>;
