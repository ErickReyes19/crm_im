import { getSessionPermisos } from "@/auth";
import { getClientesAsignadosOpciones } from "@/app/(protected)/clientes/actions";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { Formulario } from "../../components/Form";
import { getNotaById } from "../../actions";

export default async function EditNotaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_notas")) return <NoAcceso />;
  const { id } = await params;
  const nota = await getNotaById(id);
  if (!nota) redirect("/notas");
  const clientes = await getClientesAsignadosOpciones();

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={Pencil} description="Edita una nota" screenName="Editar nota" /><Formulario isUpdate initialData={{ id: nota.id, clienteId: nota.clienteId, contenido: nota.contenido, evidencias: nota.evidencias.map((e) => e.imagenB64) }} clientes={clientes} /></div>;
}
