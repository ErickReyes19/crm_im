"use client";

import { Button } from "@/components/ui/button";
import { formatHondurasDateTime } from "@/lib/date-format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export type NotaTableRow = {
  id: string;
  contenido: string;
  createAt: Date;
  evidencias: { id: string }[];
  cliente: { nombre: string; apellido: string };
  usuario: { usuario: string; nombre: string | null };
  usuarioFiltro: string;
};

export const columns: ColumnDef<NotaTableRow>[] = [
  { id: "cliente", accessorFn: (n) => `${n.cliente.nombre} ${n.cliente.apellido}`, header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Cliente <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { id: "usuario", accessorFn: (n) => n.usuarioFiltro, header: "Usuario" },
  { accessorKey: "contenido", header: "Nota", cell: ({ row }) => {
      const contenido = row.original.contenido;
      const text = contenido.length > 120 ? `${contenido.slice(0, 120)}…` : contenido;

      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="inline-block max-w-[20rem] wrap-break-word line-clamp-2 cursor-help">{text}</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="whitespace-pre-wrap wrap-break-word text-sm text-foreground">{contenido}</p>
          </HoverCardContent>
        </HoverCard>
      );
    }
  },
  { id: "evidencias", accessorFn: (n) => n.evidencias.length, header: "Evidencias", cell: ({ row }) => row.original.evidencias.length },
  { id: "fecha", accessorFn: (n) => n.createAt, header: "Fecha", cell: ({ row }) => formatHondurasDateTime(row.original.createAt) },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/notas/${row.original.id}`}><DropdownMenuItem>Ver nota</DropdownMenuItem></Link><Link href={`/notas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu> },
];
