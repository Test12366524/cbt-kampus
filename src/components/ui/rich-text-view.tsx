"use client";

type RichTextViewProps = {
  html?: string | null;
  className?: string;
};

export default function RichTextView({ html, className }: RichTextViewProps) {
  if (!html) {
    return <div className="text-muted-foreground text-sm">-</div>;
  }

  return (
    <div
      className={`
        text-sm leading-relaxed
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:border
        [&_video]:max-w-full [&_video]:h-auto [&_video]:rounded-md
        [&_iframe]:max-w-full
        ${className ?? ""}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}