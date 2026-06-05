import { getSession } from "@/auth";
import { uploadImageToS3 } from "@/lib/s3-storage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ folder: string }> }) {
  const session = await getSession();
  if (!session?.IdUser) return Response.json({ error: "Sesión requerida" }, { status: 401 });

  const { folder } = await params;
  if (folder !== "ventas" && folder !== "notas") {
    return Response.json({ error: "Carpeta inválida" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Archivo requerido" }, { status: 400 });
  }

  try {
    const uploaded = await uploadImageToS3(file, folder);
    return Response.json({ ...uploaded, url: `/api/media/${uploaded.ubicacion}` });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo subir el archivo" }, { status: 500 });
  }
}
