"use client";

import { IconChevronDown, type Icon } from "@tabler/icons-react";

// import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    children?: { title: string; url: string }[];
  }[];
}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <Link href="/admin">
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>Shortcut</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </Link>
        </SidebarMenu> */}

        <SidebarMenu>
          {items.map((item) => {
            const isParentActive =
              item.children?.some((child) => pathname === child.url) ||
              pathname === item.url;
            const isOpen = openMenus.includes(item.title);

            return (
              <div key={item.title}>
                <SidebarMenuItem>
                  {item.children ? (
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => toggleMenu(item.title)}
                      className={isParentActive ? "bg-muted font-semibold" : ""}
                    >
                      {item.icon && <item.icon />}
                      <span className="flex-1">{item.title}</span>
                      <IconChevronDown
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        size={16}
                      />
                    </SidebarMenuButton>
                  ) : (
                    <Link href={item.url!}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        data-state={
                          pathname === item.url ? "active" : undefined
                        }
                        className={
                          pathname === item.url ? "bg-muted font-semibold" : ""
                        }
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </SidebarMenuItem>

                {/* Submenu */}
                {item.children && isOpen && (
                  <div className="pl-6 flex flex-col gap-1 py-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.url;
                      return (
                        <Link href={child.url} key={child.title}>
                          <SidebarMenuButton
                            tooltip={child.title}
                            className={isActive ? "bg-muted font-semibold" : ""}
                          >
                            <span>{child.title}</span>
                          </SidebarMenuButton>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
