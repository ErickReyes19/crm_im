"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Pencil, Plus, Search, StickyNote } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Cliente } from "../schema";

type ClienteMobileRow = Cliente & {
  usuarioAsignado?: { id: string; usuario: string } | null;
};

export default function ClientesListMobile({ clientes, canEdit, canViewAllClients }: { clientes: ClienteMobileRow[]; canEdit: boolean; canViewAllClients?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("todos");
  const userOptions = useMemo(() => {
    if (!canViewAllClients) return [];

    return [...new Set(clientes.map((cliente) => cliente.usuarioAsignado?.usuario).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
  }, [clientes, canViewAllClients]);
  const filtered = clientes.filter((c) => {
    if (canViewAllClients && selectedUser !== "todos" && c.usuarioAsignado?.usuario !== selectedUser) return false;

    return `${c.nombre} ${c.apellido} ${c.usuarioAsignado?.usuario ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return <div className="space-y-4"><Link href="/clientes/create">
    <Button className="w-full">Nuevo cliente
      <Plus /></Button></Link><div className="relative">
      <Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>{canViewAllClients && <Select value={selectedUser} onValueChange={setSelectedUser}><SelectTrigger><SelectValue placeholder="Ver clientes por usuario" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los usuarios</SelectItem>{userOptions.map((usuario) => <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>)}</SelectContent></Select>}{filtered.map((c) => <div key={c.id} className="p-4 border rounded-lg">
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
