import { z } from "zod";

export const NotaSchema = z.object({
  id: z.string().optional(),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  contenido: z.string().min(1, "La nota es requerida"),
  evidencias: z.array(z.string()).default([]),
});

export type Nota = z.output<typeof NotaSchema>;
export type NotaFormValues = z.input<typeof NotaSchema>;
