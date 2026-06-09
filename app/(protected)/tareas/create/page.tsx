import { getClienteById } from "@/app/(protected)/clientes/actions";
import { getSession, getSessionPermisos } from "@/auth";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { getClientesConNotasOpciones, getNotasOpcionesByCliente } from "../actions";
import { Formulario } from "../components/Form";

export default async function CreateTareaPage({ searchParams }: { searchParams: Promise<{ clienteId?: string; notaId?: string; returnTo?: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_tarea")) return <NoAcceso />;
  const session = await getSession();
  const { clienteId, notaId, returnTo } = await searchParams;
  const [usuarios, clientesBase, notasIniciales] = await Promise.all([
    getUsuariosOpciones(),
    getClientesConNotasOpciones(),
    clienteId ? getNotasOpcionesByCliente(clienteId) : Promise.resolve([]),
  ]);

  let clientes = clientesBase;
  if (clienteId && !clientes.some((cliente) => cliente.id === clienteId)) {
    const cliente = await getClienteById(clienteId);
    if (cliente) {
      clientes = [...clientes, {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        usuarioAsignadoId: cliente.usuarioAsignadoId,
      }];
    }
  }

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={PlusCircle} description="Crea tareas de seguimiento enlazadas a notas" screenName="Crear tarea" /><Formulario usuarios={usuarios} clientes={clientes} currentUserId={session?.IdUser ?? ""} notasIniciales={notasIniciales} initialData={{ clienteId, notaId }} returnTo={returnTo} canCreateNota={permisos.includes("crear_notas")} /></div>;
}
