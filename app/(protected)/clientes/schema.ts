import { z } from "zod";

export const ClienteSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  ciudad: z.string().min(1, "La ciudad es requerida"),
  numero: z.string().min(1, "El número de contacto es requerido"),
  etiqueta: z.enum(["NUEVO", "INTERESADO"]),
  usuarioAsignadoId: z.string().optional(),
  activo: z.boolean().default(true),
});

export type Cliente = z.output<typeof ClienteSchema>;
export type ClienteFormValues = z.input<typeof ClienteSchema>;
