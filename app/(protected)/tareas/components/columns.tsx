"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatHondurasDate } from "@/lib/date-format";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ArrowUpDown, CheckCircle2, Clock3, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cambiarEstadoTarea } from "../actions";

export type TareaTableRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  fechaObjetivo: Date;
  nota: { cliente: { nombre: string; apellido: string } };
  usuario: { id: string; usuario: string; nombre: string | null };
  usuarioFiltro: string;
};

function getAlert(fechaObjetivo: Date) {
  const hoy = new Date();
  const iniHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const objetivo = new Date(new Date(fechaObjetivo).getFullYear(), new Date(fechaObjetivo).getMonth(), new Date(fechaObjetivo).getDate()).getTime();
  if (objetivo < iniHoy) return { text: "Vencida", className: "text-red-600", Icon: AlertTriangle };
  if (objetivo === iniHoy) return { text: "Hoy", className: "text-yellow-600", Icon: Clock3 };
  return { text: "Próxima", className: "text-green-600", Icon: CheckCircle2 };
}

function getUsuarioLabel(usuario: TareaTableRow["usuario"]) {
  return usuario.nombre ? `${usuario.nombre} (${usuario.usuario})` : usuario.usuario;
}

export const columns: ColumnDef<TareaTableRow>[] = [
  { accessorKey: "titulo", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Título <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { id: "usuario", accessorFn: (t) => getUsuarioLabel(t.usuario), header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Usuario <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ row }) => <div className="min-w-36"><p className="font-medium">{row.original.usuario.nombre ?? row.original.usuario.usuario}</p>{row.original.usuario.nombre && <p className="text-xs text-muted-foreground">{row.original.usuario.usuario}</p>}</div> },
  { id: "cliente", accessorFn: (t) => `${t.nota.cliente.nombre} ${t.nota.cliente.apellido}`, header: "Cliente", cell: ({ row }) => `${row.original.nota.cliente.nombre} ${row.original.nota.cliente.apellido}` },
  { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => {
      const descripcion = row.original.descripcion;
      const text = descripcion ? (descripcion.length > 120 ? `${descripcion.slice(0, 120)}…` : descripcion) : "-";
      return descripcion ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="inline-block max-w-[20rem] wrap-break-word line-clamp-2 cursor-help">{text}</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="whitespace-pre-wrap wrap-break-word text-sm text-foreground">{descripcion}</p>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }
  },
  { accessorKey: "estado", header: "Estado", cell: ({ row }) => <Badge variant="outline">{row.original.estado}</Badge> },
  { id: "fechaObjetivo", accessorFn: (t) => t.fechaObjetivo, header: "Fecha / alerta", cell: ({ row }) => { const alert = getAlert(row.original.fechaObjetivo); return <div><p>{formatHondurasDate(row.original.fechaObjetivo)}</p><p className={`text-xs font-medium inline-flex items-center gap-1 ${alert.className}`}><alert.Icon className="h-3.5 w-3.5" />{alert.text}</p></div>; } },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/tareas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link><DropdownMenuItem onClick={async () => { await cambiarEstadoTarea(row.original.id, "PENDIENTE"); }}>Marcar pendiente</DropdownMenuItem><DropdownMenuItem onClick={async () => { await cambiarEstadoTarea(row.original.id, "EN_PROGRESO"); }}>Marcar en progreso</DropdownMenuItem><DropdownMenuItem onClick={async () => { await cambiarEstadoTarea(row.original.id, "COMPLETADA"); }}>Marcar completada</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
];
