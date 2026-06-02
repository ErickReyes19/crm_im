"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { resetPassword } from "@/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { schemaResetPassword, type TSchemaResetPassword } from "../schema";

export default function ResetPassword({ username }: { username: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<TSchemaResetPassword>({
    resolver: zodResolver(schemaResetPassword),
    defaultValues: { nueva: "", confirmar: "" },
  });

  const onSubmit = (values: TSchemaResetPassword) => {
    startTransition(async () => {
      const { error } = await resetPassword(values, username);
      if (error) {
        form.setError("nueva", { message: error });
        return;
      }
      router.push("/dashboard");
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="nueva"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nueva contraseña</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  {...field}
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="h-10 rounded-xl border-border/70 bg-background/90 pr-10 focus-visible:ring-2 focus-visible:ring-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-3 flex items-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FieldContent>
            <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="confirmar"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Confirmar contraseña</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="h-10 rounded-xl border-border/70 bg-background/90 pr-10 focus-visible:ring-2 focus-visible:ring-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FieldContent>
            <FieldDescription>Repite la contraseña para confirmar.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" disabled={isPending} className="h-10 w-full rounded-xl font-bold shadow-md shadow-foreground/10">
        {isPending ? "Guardando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}
