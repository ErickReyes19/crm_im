"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Cliente } from "../schema";

export const columns: ColumnDef<Cliente>[] = [
  { accessorKey: "nombre", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ row }) => `${row.original.nombre} ${row.original.apellido}` },
  { accessorKey: "correo", header: "Correo" },
  { accessorKey: "ciudad", header: "Ciudad" },
  { accessorKey: "etiqueta", header: "Etiqueta" },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/clientes/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu> },
];
