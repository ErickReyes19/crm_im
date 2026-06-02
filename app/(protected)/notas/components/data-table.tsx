/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

type UserFilter = {
  enabled: boolean;
  placeholder?: string;
};

type UserFilterableRow = { usuarioFiltro?: string };

function getUserFilterValue(row: unknown) {
  return (row as UserFilterableRow).usuarioFiltro ?? "";
}

export function DataTable<TData, TValue>({ columns, data, userFilter }: { columns: ColumnDef<TData, TValue>[]; data: TData[]; userFilter?: UserFilter }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState("todos");
  const userOptions = React.useMemo(() => {
    if (!userFilter?.enabled) return [];

    return [...new Set(data.map((row) => getUserFilterValue(row)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [data, userFilter?.enabled]);
  const filteredData = React.useMemo(() => {
    if (!userFilter?.enabled || selectedUser === "todos") return data;

    return data.filter((row) => getUserFilterValue(row) === selectedUser);
  }, [data, selectedUser, userFilter?.enabled]);

  const table = useReactTable({ data: filteredData, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), state: { sorting, columnFilters, globalFilter }, globalFilterFn: (row) => Object.values(row.original as Record<string, unknown>).some((value) => String(value).toLowerCase().includes(globalFilter.toLowerCase())) });

  return <div className="rounded-md border p-4"><div className="flex flex-col items-center justify-between gap-3 py-4 md:flex-row"><div className="flex w-full flex-col gap-3 md:flex-row"><Input placeholder="Filtrar notas" value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="w-full md:max-w-sm" />{userFilter?.enabled && <Select value={selectedUser} onValueChange={setSelectedUser}><SelectTrigger className="w-full md:w-64"><SelectValue placeholder={userFilter.placeholder ?? "Clasificar por usuario"} /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los usuarios</SelectItem>{userOptions.map((usuario) => <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>)}</SelectContent></Select>}</div><Button asChild className="w-full md:w-auto"><Link href="/notas/create" className="flex items-center gap-2">Nueva nota <Plus /></Link></Button></div><div className="rounded-md border"><Table><TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-24">Sin resultados.</TableCell></TableRow>}</TableBody></Table></div><div className="flex items-center justify-end space-x-2 py-4"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button></div></div>;
}
