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
  value: number | null; // state pakai number
  onChange: (value: number) => void;
  onSearchChange?: (query: string) => void;
  /** Dipanggil OTOMATIS setiap kali popover dibuka, cocok untuk refetch RTK Query */
  onOpenRefetch?: () => void;
  data: T[];
  isLoading?: boolean;
  placeholder?: string;
  getOptionLabel?: (item: T) => string;
}

export function Combobox<T extends { id: number | string }>({
  value,
  onChange,
  onSearchChange,
  onOpenRefetch,
  data,
  isLoading,
  placeholder = "Pilih Data",
  getOptionLabel,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  // Panggil refetch setiap kali dibuka
  React.useEffect(() => {
    if (open) onOpenRefetch?.();
  }, [open, onOpenRefetch]);

  // samakan tipe saat mencari selected
  const selected = React.useMemo(
    () => data.find((item) => Number(item.id) === Number(value)),
    [data, value]
  );

  const defaultOptionLabel = (item: T) => {
    if ("name" in item && "email" in item) {
      const i = item as unknown as { name: string; email: string };
      return `${i.name} (${i.email})`;
    }
    if ("name" in item) {
      const i = item as unknown as { name: string };
      return i.name;
    }
    return `ID: ${item.id}`;
  };

  return (
    // modal={false} agar nyaman dipakai di dalam Dialog
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="justify-between w-full"
          // ekstra guard: kalau sedang tertutup dan user klik, refetch segera
          onClick={() => {
            if (!open) onOpenRefetch?.();
          }}
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
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari..."
            onFocus={() => onOpenRefetch?.()}
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
                    // coerce dari string ke number
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