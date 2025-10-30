"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  label: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  children: ReactNode; // icon
  className?: string;
  variant?: "ghost" | "secondary" | "outline" | "default" | "destructive";
  disabled?: boolean;
};

export default function ActionIcon({
  label,
  onClick,
  children,
  className,
  variant = "outline",
  disabled = false,
}: Props) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={variant}
            onClick={onClick}
            className={cn("h-9 w-9", className)}
            aria-label={label}
            title={label}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}