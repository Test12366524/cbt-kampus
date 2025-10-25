"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  lastPage: number;
  onChange: (p: number) => void;
};

export default function Pager({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 7
  );

  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "default" : "outline"}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        size="sm"
        variant="outline"
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}