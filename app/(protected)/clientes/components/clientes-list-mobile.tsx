"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Pencil, Plus, Search, StickyNote } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Cliente, ETIQUETA_LABELS, ETIQUETA_VALUES } from "../schema";

type ClienteMobileRow = Cliente & {
  usuarioAsignado?: { id: string; usuario: string } | null;
};

export default function ClientesListMobile({ clientes, canEdit, canViewAllClients, defaultSelectedUser }: { clientes: ClienteMobileRow[]; canEdit: boolean; canViewAllClients?: boolean; defaultSelectedUser?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(defaultSelectedUser ?? "todos");
  const [selectedEtiqueta, setSelectedEtiqueta] = useState("todos");
  const userOptions = useMemo(() => {
    if (!canViewAllClients) return [];

    const options = [...new Set(clientes.map((cliente) => cliente.usuarioAsignado?.usuario).filter(Boolean) as string[])];
    if (defaultSelectedUser && !options.includes(defaultSelectedUser)) {
      options.push(defaultSelectedUser);
    }
    return options.sort((a, b) => a.localeCompare(b));
  }, [clientes, canViewAllClients, defaultSelectedUser]);
  const userFiltered = useMemo(() => {
    if (!canViewAllClients || selectedUser === "todos") return clientes;
    return clientes.filter((c) => c.usuarioAsignado?.usuario === selectedUser);
  }, [clientes, canViewAllClients, selectedUser]);
  const etiquetaCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: userFiltered.length };
    for (const etiqueta of ETIQUETA_VALUES) {
      counts[etiqueta] = userFiltered.filter((c) => c.etiqueta === etiqueta).length;
    }
    return counts;
  }, [userFiltered]);
  const filtered = userFiltered.filter((c) => {
    if (selectedEtiqueta !== "todos" && c.etiqueta !== selectedEtiqueta) return false;

    return `${c.nombre} ${c.apellido} ${c.usuarioAsignado?.usuario ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return <div className="space-y-4"><Link href="/clientes/create">
    <Button className="w-full">Nuevo cliente
      <Plus /></Button></Link><div className="relative">
      <Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
    <Select value={selectedEtiqueta} onValueChange={setSelectedEtiqueta}>
      <SelectTrigger><SelectValue placeholder="Filtrar por etiqueta" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos los clientes ({etiquetaCounts.todos})</SelectItem>
        {ETIQUETA_VALUES.map((etiqueta) => (
          <SelectItem key={etiqueta} value={etiqueta}>{ETIQUETA_LABELS[etiqueta]} ({etiquetaCounts[etiqueta]})</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {canViewAllClients && (
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger><SelectValue placeholder="Ver clientes por usuario" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los usuarios</SelectItem>
          {userOptions.map((usuario) => <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>)}
        </SelectContent>
      </Select>
    )}
    <p className="text-sm text-muted-foreground">{filtered.length} cliente{filtered.length === 1 ? "" : "s"}</p>
    {filtered.map((c) => <div key={c.id} className="p-4 border rounded-lg">
      <div className="flex justify-between"><div><p className="font-medium">{c.nombre} {c.apellido}</p>
        {canViewAllClients && <p className="text-xs text-muted-foreground">Usuario: {c.usuarioAsignado?.usuario ?? "Sin usuario"}</p>}<p className="text-xs">{c.ciudad} • {c.etiqueta}</p>
      </div>
        <div className="flex">
          <Link href={`/clientes/${c.id}/profile`}>
            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" />
            </Button></Link><Link href={`/notas/create?clienteId=${c.id}`}>
            <Button variant="ghost" size="icon"><StickyNote className="h-4 w-4" />
            </Button></Link>{canEdit && <Link href={`/clientes/${c.id}/edit`}>
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" />
              </Button></Link>}
        </div>
      </div>
    </div>)}
  </div>;
}
