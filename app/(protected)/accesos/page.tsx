import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isSuperAdminSession } from "@/lib/access-scope";
import { formatHondurasDateTime } from "@/lib/date-format";
import { Activity } from "lucide-react";
import { getAccesosUsuarios } from "./actions";

export default async function AccesosPage() {
  const session = await getSession();
  const permisos = session?.Permiso;
  if (!session || (!permisos?.includes("ver_online") && !isSuperAdminSession(session))) return <NoAcceso />;

  const usuarios = await getAccesosUsuarios();
  const totalOnline = usuarios.filter((usuario) => usuario.estaOnline).length;

  return (
    <div className="container mx-auto space-y-4 py-2">
      <HeaderComponent Icon={Activity} description="Consulta usuarios conectados y su último inicio de sesión" screenName="Accesos" />

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios online</CardTitle>
            <CardDescription>Sesiones marcadas como activas dentro de la ventana vigente.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totalOnline}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios registrados</CardTitle>
            <CardDescription>Usuarios con información de acceso disponible.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{usuarios.length}</CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último inicio de sesión</TableHead>
              <TableHead>Última actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <div className="font-medium">{usuario.usuario}</div>
                  <div className="text-xs text-muted-foreground">{usuario.email}</div>
                </TableCell>
                <TableCell>{usuario.nombre ?? "Sin nombre"}</TableCell>
                <TableCell>{usuario.rol}</TableCell>
                <TableCell><Badge variant={usuario.estaOnline ? "default" : "secondary"}>{usuario.estaOnline ? "Online" : "Offline"}</Badge></TableCell>
                <TableCell>{formatHondurasDateTime(usuario.ultimoInicioSesion)}</TableCell>
                <TableCell>{formatHondurasDateTime(usuario.ultimaActividad)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
