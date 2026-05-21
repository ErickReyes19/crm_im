// app/layout.tsx

import { getSession } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sesion = await getSession();

  if (!sesion) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
<<<<<<< HEAD
      <main className="w-full">
=======
      <main className="min-w-0 w-full px-4 md:px-8 overflow-x-hidden">
>>>>>>> ebad26c6d0dab76c906ee4420f1a900b6f4aee37

        {children}
      </main>
    </SidebarProvider>
  );
}
