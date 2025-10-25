"use client";

import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronsUpDown } from "lucide-react";

interface ComboboxProps<T extends { id: number | string }> {
  value: number | null; // <- state pakai number
  onChange: (value: number) => void;
  onSearchChange?: (query: string) => void;
  data: T[];
  isLoading?: boolean;
  placeholder?: string;
  getOptionLabel?: (item: T) => string;
}

export function Combobox<T extends { id: number | string }>({
  value,
  onChange,
  onSearchChange,
  data,
  isLoading,
  placeholder = "Pilih Data",
  getOptionLabel,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  // ➜ KUNCI: samakan tipe saat mencari selected
  const selected = React.useMemo(
    () => data.find((item) => Number(item.id) === Number(value)),
    [data, value]
  );

  const defaultOptionLabel = (item: T) => {
    if ("name" in item && "email" in item) {
      return `${(item as { name: string; email: string }).name} (${
        (item as { name: string; email: string }).email
      })`;
    }
    if ("name" in item) {
      return (item as { name: string }).name;
    }
    return `ID: ${item.id}`;
  };

  return (
    // ⬇️ Penting: modal={false} untuk dipakai di dalam Dialog
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="justify-between w-full"
        >
          {selected
            ? (getOptionLabel ?? defaultOptionLabel)(selected)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        // cegah autofocus yang kadang bikin fokus lompat saat di Dialog
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari..."
            onValueChange={(val) => {
              if (onSearchChange) onSearchChange(val);
            }}
          />
          <CommandList>
            {isLoading && (
              <CommandItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </CommandItem>
            )}
            <CommandEmpty>Tidak ditemukan</CommandEmpty>

            {data.map((item) => {
              const idNum = Number(item.id);
              const isSelected = Number(value) === idNum;
              return (
                <CommandItem
                  key={`${item.id}`}
                  // value dipakai untuk keyboard nav; tetap string
                  value={String(item.id)}
                  onSelect={(val) => {
                    // ➜ KUNCI: coerce dari string ke number
                    const picked = Number(val);
                    onChange(Number.isNaN(picked) ? idNum : picked);
                    setOpen(false);
                  }}
                >
                  <span className={isSelected ? "font-semibold" : ""}>
                    {(getOptionLabel ?? defaultOptionLabel)(item)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}