import { getSession } from "@/auth";
import { deleteImageFromS3 } from "@/lib/s3-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) return Response.json({ error: "Sesión requerida" }, { status: 401 });

  const payload = await request.json().catch(() => ({}));
  const key = typeof payload.key === "string" ? payload.key : "";
  if (!key) return Response.json({ error: "Key requerida" }, { status: 400 });
  if (!key.startsWith("ventas/") && !key.startsWith("notas/")) {
    return Response.json({ error: "Ruta inválida" }, { status: 400 });
  }

  try {
    await deleteImageFromS3(key);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error eliminando imagen de S3:", error);
    const message = error instanceof Error ? error.message : "No se pudo eliminar la imagen";
    return Response.json({ error: message }, { status: 500 });
  }
}
