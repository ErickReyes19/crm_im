"use client";
import { cambiarEstadoTarea } from "../actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export type TareaTableRow = { id: string; titulo: string; descripcion: string | null; estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA"; fechaObjetivo: Date; nota: { cliente: { nombre: string; apellido: string } } };

function EstadoActions({ id }: { id: string }) {
  return <div className="flex gap-1">{(["PENDIENTE", "EN_PROGRESO", "COMPLETADA"] as const).map((e) => <form key={e} action={async () => { await cambiarEstadoTarea(id, e); }}><Button size="sm" variant="outline" type="submit">{e}</Button></form>)}</div>;
}

export const columns: ColumnDef<TareaTableRow>[] = [
  { accessorKey: "titulo", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Título <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { id: "cliente", accessorFn: (t) => `${t.nota.cliente.nombre} ${t.nota.cliente.apellido}`, header: "Cliente", cell: ({ row }) => `${row.original.nota.cliente.nombre} ${row.original.nota.cliente.apellido}` },
  { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => <span className="line-clamp-2">{row.original.descripcion ?? "-"}</span> },
  { accessorKey: "estado", header: "Estado" },
  { id: "fechaObjetivo", accessorFn: (t) => t.fechaObjetivo, header: "Fecha", cell: ({ row }) => new Date(row.original.fechaObjetivo).toISOString().slice(0, 10) },
  { id: "estadoRapido", header: "Cambiar estado", cell: ({ row }) => <EstadoActions id={row.original.id} /> },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/tareas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu> },
];
