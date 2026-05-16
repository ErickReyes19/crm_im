"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
export type TareaTableRow = {
  id?: string;
  nombre: string;
  descripcion: string;
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  fechaFinalizacion: Date | string;
  asignadoAId: string;
  asignadoPorId: string;
  asignadoA?: { usuario: string } | null;
  asignadoPor?: { usuario: string } | null;
  productosObjetivo?: Array<{ cantidadObjetivo: number; producto?: { nombre: string } | null }>;
};

export const columns: ColumnDef<TareaTableRow>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.descripcion}</span>,
  },
  {
    accessorKey: "estado",
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Estado <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
  },
  {
    id: "asignadoA",
    accessorFn: (tarea) => tarea.asignadoA?.usuario ?? "",
    header: "Asignado a",
    cell: ({ row }) => row.original.asignadoA?.usuario ?? "Sin asignar",
  },
  {
    id: "asignadoPor",
    accessorFn: (tarea) => tarea.asignadoPor?.usuario ?? "",
    header: "Asignado por",
    cell: ({ row }) => row.original.asignadoPor?.usuario ?? "Sin usuario",
  },
  {
    id: "productosObjetivoResumen",
    header: "Objetivo productos",
    cell: ({ row }) => row.original.productosObjetivo?.length ? row.original.productosObjetivo.map((detalle) => `${detalle.cantidadObjetivo} x ${detalle.producto?.nombre ?? "Producto"}`).join(", ") : "Sin objetivo",
  },
  {
    accessorKey: "fechaFinalizacion",
    header: "Fecha fin",
    cell: ({ row }) => new Date(row.original.fechaFinalizacion).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/tareas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu>,
  },
];
