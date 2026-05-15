import { z } from "zod";
export const VentaSchema = z.object({ id: z.string().optional(), clienteId: z.string().min(1), usuarioId: z.string().min(1), total: z.coerce.number().min(0), estado: z.enum(["PROCESO", "ENVIO", "ENTREGADA"]) });
export type Venta = z.infer<typeof VentaSchema>;
