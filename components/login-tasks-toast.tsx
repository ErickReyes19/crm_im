"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const LOGIN_TASKS_STORAGE_KEY = "crm-login-tareas-hoy";

export function saveLoginTasksToast(tareasHoy: number) {
  if (typeof window === "undefined" || tareasHoy <= 0) return;
  window.sessionStorage.setItem(LOGIN_TASKS_STORAGE_KEY, String(tareasHoy));
}

export function LoginTasksToast() {
  useEffect(() => {
    const stored = window.sessionStorage.getItem(LOGIN_TASKS_STORAGE_KEY);
    if (!stored) return;

    window.sessionStorage.removeItem(LOGIN_TASKS_STORAGE_KEY);
    const tareasHoy = Number(stored);
    if (!Number.isFinite(tareasHoy) || tareasHoy <= 0) return;

    toast.info(`Tienes ${tareasHoy} tarea${tareasHoy === 1 ? "" : "s"} para hoy. Te llevamos al módulo de tareas.`);
  }, []);

  return null;
}
