import { getSession } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { LoginTasksToast } from "@/components/login-tasks-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sesion = await getSession();

  if (!sesion) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="w-full p-2">
        <LoginTasksToast />
        {children}
      </main>
    </SidebarProvider>
  );
}
