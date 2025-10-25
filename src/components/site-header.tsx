'use client'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { ThemeSelector } from "./theme-selector"
import { useGetNotificationsQuery } from "@/services/notification.service";


import { IconBell } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export function SiteHeader({ title }: { title: string }) {
  const { data } = useGetNotificationsQuery(
    { page: 1, paginate: 10 },
    {
      pollingInterval: 5000, // cek update setiap 5 detik
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );  
  const notifications = data?.data || [];
  const hasUnread = notifications.some((n) => !n.read_at);

  const route = useRouter()
  const handleNotif = () => {
    route.push("/cms/notifications")
  }
  
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative cursor-pointer" onClick={handleNotif}>
            <IconBell className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </div>
          <ThemeSelector />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
