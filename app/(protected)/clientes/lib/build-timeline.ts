type UsuarioRef = { usuario: string; nombre: string | null };

export type ClienteTimelineNota = {
  id: string;
  contenido: string;
  createAt: Date;
  evidencias: { id: string }[];
  usuario: UsuarioRef;
};

export type ClienteTimelineTarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  fechaObjetivo: Date;
  createAt: Date;
  nota: { id: string; contenido: string };
  usuario: UsuarioRef;
};

export type ClienteTimelineVenta = {
  id: string;
  total: number;
  estado: "PROCESO" | "ENVIO" | "ENTREGADA";
  metodoPago: "EFECTIVO" | "TRANSFERENCIA";
  tipoDocumento: "RECIBO" | "FACTURA";
  createAt: Date;
  productos: { cantidad: number; producto: { nombre: string } }[];
  usuario: UsuarioRef;
};

export type ClienteTimelineEvent =
  | { type: "nota"; date: Date; data: ClienteTimelineNota }
  | { type: "tarea"; date: Date; data: ClienteTimelineTarea }
  | { type: "venta"; date: Date; data: ClienteTimelineVenta };

export function buildClienteTimeline({
  notas,
  tareas,
  ventas,
}: {
  notas: ClienteTimelineNota[];
  tareas: ClienteTimelineTarea[];
  ventas: ClienteTimelineVenta[];
}): ClienteTimelineEvent[] {
  const events: ClienteTimelineEvent[] = [
    ...notas.map((nota) => ({ type: "nota" as const, date: nota.createAt, data: nota })),
    ...tareas.map((tarea) => ({ type: "tarea" as const, date: tarea.createAt, data: tarea })),
    ...ventas.map((venta) => ({ type: "venta" as const, date: venta.createAt, data: venta })),
  ];

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
