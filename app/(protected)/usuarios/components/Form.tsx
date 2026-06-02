"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Rol } from "../../roles/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Copy, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { createUsuario, resetUsuarioPassword, updateUsuario } from "../actions";
import { Usuario, UsuarioSchema } from "../schema";

function generateClientPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
  const values = new Uint32Array(14);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

async function copyTextToClipboard(text: string) {
  if (!text.trim()) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue with fallback for browsers/contexts that expose Clipboard API but block it.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export function Formulario({
  isUpdate,
  initialData,
  roles,
}: {
  isUpdate: boolean;
  initialData?: z.infer<typeof UsuarioSchema>;
  roles: Rol[];
}) {
  const router = useRouter();
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<z.infer<typeof UsuarioSchema>>({
    resolver: zodResolver(UsuarioSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: z.infer<typeof UsuarioSchema>) {
    const usuarioData = {
      usuario: data.usuario,
      email: data.email,
      password: data.password,
      rol_id: data.rol_id,
      activo: isUpdate ? data.activo : undefined,
      id: isUpdate ? data.id : undefined,
    };

    try {
      if (isUpdate) {
        await updateUsuario(usuarioData as Usuario);
        toast.success("El usuario ha sido actualizado.");
      } else {
        await createUsuario(usuarioData as Usuario);
        toast.success("El usuario ha sido creado.");
      }

      router.push("/usuarios");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hubo un problema al guardar.");
    }
  }

  async function onResetPassword(password?: string) {
    if (!initialData?.id) return;

    try {
      setIsResettingPassword(true);
      const result = await resetUsuarioPassword(initialData.id, password);
      setTemporaryPassword(result.password);
      setManualPassword(result.password);
      const copied = await copyTextToClipboard(result.password);
      toast.success(copied ? "Contraseña restablecida y copiada al portapapeles." : "Contraseña restablecida. Cópiala manualmente desde el campo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hubo un problema al restablecer la contraseña.");
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 border rounded-md p-4"
    >
      {/* Usuario */}
      <Controller
        name="usuario"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Usuario</FieldLabel>
            <FieldContent>
              <Input placeholder="Usuario" {...field} />
            </FieldContent>
            <FieldDescription>
              Ingresa el nombre de usuario.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      {/* Email */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input placeholder="correo@dominio.com" type="email" {...field} />
            </FieldContent>
            <FieldDescription>
              Ingresa el email de usuario.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      {/* Contraseña */}
      {!isUpdate && (
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Contraseña</FieldLabel>
              <FieldContent className="flex gap-2">
                <Input placeholder="Contraseña" type="text" {...field} value={field.value ?? ""} />
                <Button type="button" variant="outline" onClick={() => {
                  form.setValue("password", generateClientPassword(), { shouldDirty: true, shouldValidate: true });
                }}><RefreshCcw className="h-4 w-4" /></Button>
                <Button type="button" variant="outline" onClick={async () => {
                  const copied = await copyTextToClipboard(form.getValues("password") ?? "");
                  toast[copied ? "success" : "error"](copied ? "Contraseña copiada." : "No se pudo copiar. Selecciona y copia la contraseña manualmente.");
                }}><Copy className="h-4 w-4" /></Button>
              </FieldContent>
              <FieldDescription>
                Usa una contraseña fija para el nuevo usuario.
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      )}


      {/* Rol */}
      <Controller
        name="rol_id"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Rol</FieldLabel>
            <FieldContent>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id || ""}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            <FieldDescription>
              Selecciona el rol del usuario.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      {/* Restablecer contraseña (solo update) */}
      {isUpdate && (
        <Field>
          <FieldLabel>Restablecer contraseña</FieldLabel>
          <FieldContent className="space-y-3">
            <Input
              value={manualPassword}
              onChange={(event) => setManualPassword(event.target.value)}
              placeholder="Escribe una contraseña manual o genera una aleatoria"
              type="text"
              className="font-mono"
              aria-label="Nueva contraseña temporal"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => onResetPassword()} disabled={isResettingPassword}>
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Generar y aplicar aleatoria
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onResetPassword(manualPassword)}
                disabled={isResettingPassword || !manualPassword.trim()}
              >
                Aplicar contraseña manual
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!temporaryPassword}
                onClick={async () => {
                  const copied = await copyTextToClipboard(temporaryPassword);
                  toast[copied ? "success" : "error"](copied ? "Contraseña copiada." : "No se pudo copiar. Selecciona y copia la contraseña manualmente.");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </div>
          </FieldContent>
          <FieldDescription>
            Genera una contraseña aleatoria o escribe una manual. Al aplicarla, el usuario deberá cambiarla al iniciar sesión en /reset-password.
          </FieldDescription>
        </Field>
      )}

      {/* Estado (solo update) */}
      {isUpdate && (
        <Controller
          name="activo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) =>
                    field.onChange(value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>
                Define si el usuario está activo o inactivo.
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : isUpdate ? (
            "Actualizar"
          ) : (
            "Crear"
          )}
        </Button>
      </div>
    </form>
  );
}
