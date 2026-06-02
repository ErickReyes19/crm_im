import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Crown, MousePointerClick, UserRound, Users } from "lucide-react";
import Link from "next/link";

type Search = Promise<{ adminId?: string; vendedorId?: string }>;

async function getData(adminId?: string, vendedorId?: string) {
  const admins = await prisma.usuarios.findMany({
    where: { rol: { nombre: "ADMINISTRADOR" }, activo: true },
    select: { id: true, usuario: true, nombre: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });

  const selectedAdminId = adminId && admins.some((a) => a.id === adminId) ? adminId : null;

  const vendedoresBase = selectedAdminId
    ? await prisma.usuarios.findMany({
        where: { adminPadreId: selectedAdminId, activo: true },
        select: { id: true, usuario: true, nombre: true },
        orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
      })
    : [];

  const selectedAdmin = selectedAdminId ? admins.find((admin) => admin.id === selectedAdminId) : null;
  const vendedores = selectedAdmin
    ? [
        { ...selectedAdmin, tipo: "Administrador" },
        ...vendedoresBase.map((vendedor) => ({ ...vendedor, tipo: "Vendedor" })),
      ]
    : [];

  const selectedVendedorId =
    vendedorId && vendedores.some((v) => v.id === vendedorId) ? vendedorId : selectedAdminId;

  const clientes = selectedVendedorId
    ? await prisma.cliente.findMany({
        where: { usuarioAsignadoId: selectedVendedorId, activo: true },
        include: { usuarioAsignado: { select: { usuario: true, nombre: true } } },
        orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
      })
    : [];

  return { admins, selectedAdminId, vendedores, selectedVendedorId, clientes };
}

export default async function JerarquiaUsuariosPage({ searchParams }: { searchParams: Search }) {
  const session = await getSession();
  if (!session?.Permiso?.includes("super_admin")) return <NoAcceso />;

  const params = await searchParams;
  const { admins, selectedAdminId, vendedores, selectedVendedorId, clientes } = await getData(params.adminId, params.vendedorId);

  return (
    <div className="container mx-auto py-2 space-y-4">
      <HeaderComponent Icon={Users} screenName="Jerarquía de usuarios" description="Selecciona administrador y luego vendedor o administrador para consultar sus clientes" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />1) Selecciona Administrador</CardTitle>
          <CardDescription>Haz click en un administrador para cargar sus vendedores y sus clientes directos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => {
            const active = selectedAdminId === admin.id;
            return (
              <Link
                key={admin.id}
                href={`/usuarios/jerarquia?adminId=${admin.id}`}
                className={`rounded-xl border p-3 transition hover:bg-muted/40 ${active ? "border-primary bg-primary/5" : ""}`}
              >
                <p className="font-medium">{admin.nombre || admin.usuario}</p>
                <p className="text-xs text-muted-foreground">@{admin.usuario}</p>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MousePointerClick className="h-5 w-5" />2) Selecciona Vendedor o Administrador</CardTitle>
          <CardDescription>
            {selectedAdminId ? "Haz click en el administrador o en un vendedor para ver sus clientes." : "Primero debes seleccionar un administrador."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!selectedAdminId ? (
            <p className="text-sm text-muted-foreground">Sin administrador seleccionado.</p>
          ) : vendedores.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este administrador no tiene vendedores.</p>
          ) : (
            vendedores.map((v) => {
              const active = selectedVendedorId === v.id;
              return (
                <Link
                  key={v.id}
                  href={`/usuarios/jerarquia?adminId=${selectedAdminId}&vendedorId=${v.id}`}
                  className={`flex items-center justify-between rounded-xl border p-3 transition hover:bg-muted/40 ${active ? "border-primary bg-primary/5" : ""}`}
                >
                  <div>
                    <p className="font-medium">{v.nombre || v.usuario}</p>
                    <p className="text-xs text-muted-foreground">@{v.usuario}</p>
                  </div>
                  <Badge variant={v.tipo === "Administrador" ? "default" : "secondary"}>{v.tipo}</Badge>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" />3) Clientes del usuario seleccionado</CardTitle>
          <CardDescription>
            {selectedVendedorId ? `Mostrando ${clientes.length} clientes asignados.` : "Selecciona un vendedor o administrador para consultar clientes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[520px] overflow-auto">
          {!selectedVendedorId ? (
            <p className="text-sm text-muted-foreground">No hay vendedor o administrador seleccionado.</p>
          ) : clientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este usuario no tiene clientes asignados.</p>
          ) : (
            clientes.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <p className="font-medium">{c.nombre} {c.apellido}</p>
                <p className="text-xs text-muted-foreground">{c.ciudad}</p>
                <Badge className="mt-2" variant="outline">Asignado a: {c.usuarioAsignado.nombre || c.usuarioAsignado.usuario}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
