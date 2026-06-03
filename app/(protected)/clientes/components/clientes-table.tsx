"use client";

import { Cliente } from "../schema";

type ClienteTableRow = Cliente & {
  usuarioAsignado?: { id: string; usuario: string } | null;
};
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

export default function ClientesTable({ data, canEdit, canViewAllClients }: { data: ClienteTableRow[]; canEdit: boolean; canViewAllClients: boolean }) {
  return <DataTable columns={getColumns(canEdit, canViewAllClients)} data={data} userFilter={{ enabled: canViewAllClients, placeholder: "Ver clientes por usuario" }} />;
}
