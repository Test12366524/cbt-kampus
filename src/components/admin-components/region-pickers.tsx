"use client";

import * as React from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Option = { id: string; name: string };

export interface RegionPickersProps {
  provinceId: string | null;
  regencyId: string | null;
  districtId: string | null;

  onProvinceChange: (id: string | null) => void;
  onRegencyChange: (id: string | null) => void;
  onDistrictChange: (id: string | null) => void;

  provinces: Option[];
  regencies: Option[];
  districts: Option[];

  isLoadingProvince?: boolean;
  isLoadingRegency?: boolean;
  isLoadingDistrict?: boolean;

  onSearchProvince?: (q: string) => void;
  onSearchRegency?: (q: string) => void;
  onSearchDistrict?: (q: string) => void;

  disableRegency: boolean;
  disableDistrict: boolean;
}

function ComboboxSimple(props: {
  disabled?: boolean;
  placeholder: string;
  value: string | null;
  onChange: (id: string | null) => void;
  data: Option[];
  onSearch?: (q: string) => void;
  isLoading?: boolean;
}) {
  const { disabled, placeholder, value, onChange, data, onSearch, isLoading } =
    props;
  const [open, setOpen] = React.useState(false);
  const selected = data.find((d) => d.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {selected ? selected.name : placeholder}
          </span>
          <MapPin className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      {/* z-index tinggi & cegah autofocus bentrok dengan Dialog */}
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] z-[1100] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Ketik untuk mencari…"
            onValueChange={(v) => {
              if (!onSearch) return;
              onSearch(v.length >= 2 ? v : "");
            }}
          />
          <CommandList>
            {isLoading ? (
              <CommandItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat…
              </CommandItem>
            ) : null}

            <CommandEmpty>Tidak ditemukan</CommandEmpty>

            {value && (
              <CommandItem
                value="__clear__"
                className="cursor-pointer"
                onSelect={(val) => {
                  if (val === "__clear__") {
                    onChange(null);
                    setOpen(false);
                  }
                }}
              >
                — Kosongkan —
              </CommandItem>
            )}

            {data.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.id}
                className="cursor-pointer"
                onSelect={(val) => {
                  onChange(val); // val === opt.id
                  setOpen(false);
                }}
              >
                {opt.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function RegionPickers({
  provinceId,
  regencyId,
  districtId,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  provinces,
  regencies,
  districts,
  isLoadingProvince,
  isLoadingRegency,
  isLoadingDistrict,
  onSearchProvince,
  onSearchRegency,
  onSearchDistrict,
  disableRegency,
  disableDistrict,
}: RegionPickersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <ComboboxSimple
        placeholder="Pilih Provinsi"
        value={provinceId}
        onChange={(id) => {
          onProvinceChange(id);
          onRegencyChange(null);
          onDistrictChange(null);
        }}
        data={provinces}
        onSearch={onSearchProvince}
        isLoading={isLoadingProvince}
      />

      <ComboboxSimple
        placeholder="Pilih Kabupaten/Kota"
        value={regencyId}
        onChange={(id) => {
          onRegencyChange(id);
          onDistrictChange(null);
        }}
        data={regencies}
        onSearch={onSearchRegency}
        isLoading={isLoadingRegency}
        disabled={disableRegency}
      />

      <ComboboxSimple
        placeholder="Pilih Kecamatan"
        value={districtId}
        onChange={onDistrictChange}
        data={districts}
        onSearch={onSearchDistrict}
        isLoading={isLoadingDistrict}
        disabled={disableDistrict}
      />
    </div>
  );
}