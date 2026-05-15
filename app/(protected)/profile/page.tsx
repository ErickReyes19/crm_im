import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) return <NoAcceso />;
  if (!session.Permiso?.includes("ver_profile")) return <NoAcceso />;
  if (!session.IdUser) return <NoAcceso />;

  return (
    <div className="container mx-auto py-2 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HeaderComponent Icon={User} description="Resumen de tu cuenta, suscripciones, facturas y pagos" screenName="Mi Perfil" />
        <Button asChild>
          <Link href="/checkout">Comprar con PixelPay</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Usuario</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{session.User}</p>
            <p className="text-sm text-muted-foreground">Rol: {session.Rol}</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
