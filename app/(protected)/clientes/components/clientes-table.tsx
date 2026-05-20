"use client";

import { Cliente } from "../schema";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

export default function ClientesTable({ data, canEdit }: { data: Cliente[]; canEdit: boolean }) {
  return <DataTable columns={getColumns(canEdit)} data={data} />;
}
