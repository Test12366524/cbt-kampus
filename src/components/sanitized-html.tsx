"use client";

import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";

type Props = {
  html: string;
  className?: string;
};

export default function SanitizedHtml({ html, className }: Props) {
  const safe = React.useMemo(() => sanitizeHtml(html), [html]);
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />
  );
}