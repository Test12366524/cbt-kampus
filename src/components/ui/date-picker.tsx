"use client";

import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selected?: Date | null | string;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}
  

export const DatePicker = ({
  selected,
  onChange,
  placeholderText,
  className,
}: DatePickerProps) => {
  const parsedDate =
    typeof selected === "string" ? new Date(selected) : selected;

  return (
    <ReactDatePicker
      selected={parsedDate}
      onChange={onChange}
      placeholderText={placeholderText}
      dateFormat="yyyy-MM-dd"
      className={cn(
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm",
        className
      )}
    />
  );
};
