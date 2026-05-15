import { z } from "zod";
export const TareaSchema = z.object({ id: z.string().optional(), nombre: z.string().min(1), descripcion: z.string().min(1), estado: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADA"]), fechaFinalizacion: z.coerce.date(), asignadoAId: z.string().min(1), asignadoPorId: z.string().min(1) });
export type Tarea = z.infer<typeof TareaSchema>;
