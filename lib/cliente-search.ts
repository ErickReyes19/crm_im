export type ClienteSearchFields = {
  nombre?: string | null;
  apellido?: string | null;
  ciudad?: string | null;
  numero?: string | null;
};

export function getClienteSearchText(cliente?: ClienteSearchFields | null) {
  return [cliente?.nombre, cliente?.apellido, cliente?.ciudad, cliente?.numero]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getClienteFromRow(row: Record<string, unknown>) {
  const cliente = row.cliente as ClienteSearchFields | undefined;
  if (cliente) return cliente;

  const nota = row.nota as { cliente?: ClienteSearchFields } | undefined;
  return nota?.cliente;
}

export function rowMatchesTableSearch(row: Record<string, unknown>, filterValue: string) {
  const term = String(filterValue ?? "").toLowerCase().trim();
  if (!term) return true;

  const clienteText = getClienteSearchText(getClienteFromRow(row));
  if (clienteText.includes(term)) return true;

  return Object.entries(row).some(([key, value]) => {
    if (key === "cliente" || key === "nota") return false;
    if (value instanceof Date) return value.toISOString().toLowerCase().includes(term);
    if (Array.isArray(value)) return value.some((item) => String(item).toLowerCase().includes(term));
    if (value && typeof value === "object") return false;
    return String(value ?? "").toLowerCase().includes(term);
  });
}
