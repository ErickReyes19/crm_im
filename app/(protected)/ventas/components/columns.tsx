"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Venta } from "../schema";

export type VentaTableRow = Venta & {
  cliente?: { nombre: string; apellido: string } | null;
  usuario?: { usuario: string } | null;
};

export const columns: ColumnDef<VentaTableRow>[] = [
  {
    id: "cliente",
    accessorFn: (venta) => `${venta.cliente?.nombre ?? ""} ${venta.cliente?.apellido ?? ""}`.trim(),
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Cliente <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: ({ row }) => {
      const cliente = row.original.cliente;
      return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Sin cliente";
    },
  },
  {
    id: "usuario",
    accessorFn: (venta) => venta.usuario?.usuario ?? "",
    header: "Vendedor",
    cell: ({ row }) => row.original.usuario?.usuario ?? "Usuario actual",
  },
  {
    accessorKey: "total",
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Total <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: ({ row }) => Number(row.original.total).toLocaleString("es-DO", { style: "currency", currency: "DOP" }),
  },
  { accessorKey: "estado", header: "Estado" },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/ventas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu>,
  },
];
