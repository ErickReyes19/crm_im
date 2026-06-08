import { getSession, getSessionPermisos } from "@/auth";
import { getClientesOpciones } from "@/app/(protected)/clientes/actions";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateNotaPage({ searchParams }: { searchParams: Promise<{ clienteId?: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_notas")) return <NoAcceso />;

  const session = await getSession();
  const [usuarios, clientes] = await Promise.all([getUsuariosOpciones(), getClientesOpciones()]);
  const { clienteId } = await searchParams;

  return <div className="container mx-auto py-2 space-y-4">
    <HeaderComponent Icon={PlusCircle} description="Agrega una nota al cliente con evidencia en S3" screenName="Crear nota" />
    <Formulario usuarios={usuarios} clientes={clientes} currentUserId={session?.IdUser ?? ""} initialData={{ clienteId }} />
  </div>;
}
