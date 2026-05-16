import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) return <NoAcceso />;
  if (!session.Permiso?.includes("ver_profile")) return <NoAcceso />;
  if (!session.IdUser) return <NoAcceso />;

  return (
    <div className="container mx-auto py-2 space-y-6">
      <HeaderComponent screenName="Perfil de Usuario" Icon={User } description="Perfil del usuario" />
    </div>
  );
}
