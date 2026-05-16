import { getProductosOpciones } from "@/app/(protected)/productos/actions";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getTareaById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_tarea")) return <NoAcceso />;

  const { id } = await params;
  const tarea = await getTareaById(id);
  if (!tarea) redirect("/tareas");

  const [usuarios, productos] = await Promise.all([getUsuariosOpciones(), getProductosOpciones()]);
  const productosObjetivo = tarea.productosObjetivo.map((detalle) => ({ productoId: detalle.productoId, cantidadObjetivo: detalle.cantidadObjetivo }));

  return <div><HeaderComponent Icon={Pencil} screenName="Editar tarea" description="En este apartado podrás editar una tarea" /><Formulario isUpdate initialData={{ id: tarea.id, nombre: tarea.nombre, descripcion: tarea.descripcion, estado: tarea.estado, fechaFinalizacion: tarea.fechaFinalizacion, asignadoAId: tarea.asignadoAId, asignadoPorId: tarea.asignadoPorId, productosObjetivo }} usuarios={usuarios} productos={productos} /></div>;
}
