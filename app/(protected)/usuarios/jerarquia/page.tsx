import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { Crown, Network, UserRound, Users } from "lucide-react";

async function getHierarchyData(adminId?: string) {
  const admins = await prisma.usuarios.findMany({
    where: { rol: { nombre: "ADMINISTRADOR" }, activo: true },
    select: { id: true, usuario: true, nombre: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });

  const selectedAdminId = adminId && admins.some((a) => a.id === adminId) ? adminId : admins[0]?.id;
  if (!selectedAdminId) return { admins, selectedAdminId: null, vendedores: [], clientes: [] };

  const vendedores = await prisma.usuarios.findMany({
    where: { adminPadreId: selectedAdminId, activo: true },
    select: { id: true, usuario: true, nombre: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });

  const miembrosEquipo = [selectedAdminId, ...vendedores.map((v) => v.id)];
  const clientes = await prisma.cliente.findMany({
    where: { usuarioAsignadoId: { in: miembrosEquipo }, activo: true },
    select: { id: true, nombre: true, apellido: true, ciudad: true, usuarioAsignado: { select: { id: true, usuario: true, nombre: true } } },
    orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
  });

  return { admins, selectedAdminId, vendedores, clientes };
}

export default async function JerarquiaUsuariosPage({ searchParams }: { searchParams: Promise<{ adminId?: string }> }) {
  const session = await getSession();
  if (!session?.Permiso?.includes("super_admin")) return <NoAcceso />;

  const params = await searchParams;
  const { admins, selectedAdminId, vendedores, clientes } = await getHierarchyData(params?.adminId);

  return (
    <div className="container mx-auto py-2 space-y-4">
      <HeaderComponent Icon={Network} screenName="Jerarquía de usuarios" description="Vista de administradores, sus vendedores y clientes asignados" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />Selecciona un administrador</CardTitle>
          <CardDescription>Solo usuarios con permiso super_admin pueden acceder a esta pantalla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/usuarios/jerarquia" className="max-w-md">
            <Select name="adminId" defaultValue={selectedAdminId ?? undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un administrador" />
              </SelectTrigger>
              <SelectContent>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>{admin.nombre || admin.usuario}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="submit" className="sr-only">filtrar</button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Admins activos</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{admins.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Vendedores del admin</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{vendedores.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Clientes del equipo</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{clientes.length}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Vendedores</CardTitle>
            <CardDescription>{vendedores.length === 0 ? "Este administrador no tiene vendedores asignados." : "Listado de vendedores asociados."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {vendedores.length === 0 ? <p className="text-sm text-muted-foreground">Sin vendedores</p> : vendedores.map((v) => (
              <div key={v.id} className="rounded-lg border p-3 flex items-center justify-between">
                <div><p className="font-medium">{v.nombre || v.usuario}</p><p className="text-xs text-muted-foreground">@{v.usuario}</p></div>
                <Badge variant="secondary">Vendedor</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" />Clientes del equipo</CardTitle>
            <CardDescription>Clientes del administrador seleccionado y sus vendedores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-auto">
            {clientes.length === 0 ? <p className="text-sm text-muted-foreground">No hay clientes asignados</p> : clientes.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <p className="font-medium">{c.nombre} {c.apellido}</p>
                <p className="text-xs text-muted-foreground">{c.ciudad}</p>
                <Badge className="mt-2" variant="outline">Asignado a: {c.usuarioAsignado.nombre || c.usuarioAsignado.usuario}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
