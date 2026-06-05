import { getSession } from "@/auth";
import { uploadImageToS3, createPresignedPutUrl } from "@/lib/s3-storage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ folder: string }> }) {
  const session = await getSession();
  if (!session?.IdUser) return Response.json({ error: "Sesión requerida" }, { status: 401 });

  const { folder } = await params;
  if (folder !== "ventas" && folder !== "notas") {
    return Response.json({ error: "Carpeta inválida" }, { status: 400 });
  }

  const url = new URL(request.url);
  const presign = url.searchParams.get("presign");
  if (presign === "1" || presign === "true") {
    // crear URL firmada para que el cliente suba directamente a S3
    try {
      const payload = await request.json().catch(() => ({}));
      const filename = typeof payload.filename === "string" ? payload.filename : "imagen";
      const contentType = typeof payload.contentType === "string" ? payload.contentType : "application/octet-stream";
      const presigned = await createPresignedPutUrl(filename, folder as "ventas" | "notas", contentType);
      return Response.json({ url: presigned.url, ubicacion: presigned.key, nombre: presigned.nombre });
    } catch (err) {
      console.error("Error creando presigned URL:", err);
      return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
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
    // Log completo para depuración en servidor
    console.error("Error subiendo archivo a S3:", error);
    const message = error instanceof Error ? error.message : "No se pudo subir el archivo";
    const payload = process.env.NODE_ENV === "production" ? { error: message } : { error: message, stack: error instanceof Error ? error.stack : undefined };
    return Response.json(payload, { status: 500 });
  }
}
