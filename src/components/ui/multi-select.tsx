"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"; // pastikan diimport

interface Option {
  label: string;
  value: string;
  group?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  minSelect?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  minSelect = 2,
  searchValue,
  onSearchChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const filteredOptions = searchValue
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchValue.toLowerCase())
      )
    : options;

  const grouped = filteredOptions.reduce((acc, option) => {
    const group = option.group || "Ungrouped";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  const toggleValue = (value: string) => {
    const isSelected = selected.includes(value);
    const newValues = isSelected
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newValues);
  };

  const removeValue = (value: string) => {
    const newValues = selected.filter((v) => v !== value);
    onChange(newValues);
  };

  const selectedLabels = options.filter((opt) => selected.includes(opt.value));

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between flex-wrap gap-1"
          >
            {selectedLabels.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {selectedLabels.map((opt) => (
                  <span
                    key={opt.value}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {opt.label}
                    <X
                      size={12}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(opt.value);
                      }}
                    />
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                {placeholder}
              </span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-64 overflow-auto">
          <Input
            placeholder="Cari..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="mb-2"
          />

          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} className="mb-2">
              <p className="text-xs font-medium mb-1 text-muted-foreground uppercase">
                {groupName}
              </p>
              {items.map((item) => {
                const isChecked = selected.includes(item.value);
                return (
                  <div
                    key={item.value}
                    onClick={() => toggleValue(item.value)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md hover:bg-muted",
                      isChecked && "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        isChecked
                          ? "bg-primary text-primary-foreground"
                          : "border-muted"
                      )}
                    >
                      {isChecked && <Check size={12} />}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </PopoverContent>
      </Popover>
      {selected.length < minSelect && (
        <p className="text-xs text-red-500 mt-1">
          Minimal pilih {minSelect} item.
        </p>
      )}
    </div>
  );
}
