"use client";

import { updateTareaEstado } from "../actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, Circle, Loader2, MoreHorizontal, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

const ESTADO_LABELS = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
} as const;

const ESTADO_OPTIONS = [
  { value: "PENDIENTE", label: ESTADO_LABELS.PENDIENTE, icon: Circle },
  { value: "EN_PROGRESO", label: ESTADO_LABELS.EN_PROGRESO, icon: PlayCircle },
  { value: "COMPLETADA", label: ESTADO_LABELS.COMPLETADA, icon: CheckCircle2 },
] as const;

export type TareaEstado = keyof typeof ESTADO_LABELS;

export type TareaTableRow = {
  id?: string;
  nombre: string;
  descripcion: string;
  estado: TareaEstado;
  fechaFinalizacion: Date | string;
  asignadoAId: string;
  asignadoPorId: string;
  asignadoA?: { usuario: string } | null;
  asignadoPor?: { usuario: string } | null;
  productosObjetivo?: Array<{ cantidadObjetivo: number; producto?: { nombre: string } | null }>;
};

function TareaActions({ tarea }: { tarea: TareaTableRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleEstadoChange(estado: TareaEstado) {
    if (!tarea.id || estado === tarea.estado) return;

    startTransition(async () => {
      try {
        await updateTareaEstado(tarea.id!, estado);
        toast.success(`Estado cambiado a ${ESTADO_LABELS[estado]}.`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo cambiar el estado.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          <span className="sr-only">Abrir acciones de tarea</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/tareas/${tarea.id}/edit`}>Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Cambiar estado</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ESTADO_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem key={value} disabled={isPending || value === tarea.estado} onClick={() => handleEstadoChange(value)}>
                <Icon className="h-4 w-4" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    cell: ({ row }) => ESTADO_LABELS[row.original.estado],
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
    cell: ({ row }) => <TareaActions tarea={row.original} />,
  },
];
