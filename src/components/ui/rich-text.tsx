"use client";

import dynamic from "next/dynamic";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

type ButtonList = (string | string[])[];

export type SunRichTextProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number; // kita terima number...
  readOnly?: boolean;
  uploadEndpoint?: string;
  toolbar?: ButtonList;
};

const defaultButtons: ButtonList = [
  ["undo", "redo"],
  ["bold", "italic", "underline", "strike", "removeFormat"],
  ["font", "fontSize"],
  ["fontColor", "hiliteColor"],
  ["align", "list", "lineHeight"],
  ["blockquote", "link", "image", "video", "table"],
  ["codeView", "fullScreen"],
];

export default function SunRichText({
  value,
  onChange,
  placeholder = "Tulis konten di sini…",
  minHeight = 260, // ... lalu kita konversi ke "260px"
  readOnly = false,
  uploadEndpoint = "/api/upload-image",
  toolbar,
}: SunRichTextProps) {
  const buttons = toolbar ?? defaultButtons;

  const onImageUploadBefore = (
    files: File[],
    _info: unknown,
    uploadHandler: (data: {
      result?: { url: string; name: string; size: number }[];
      errorMessage?: string;
    }) => void
  ) => {
    const file = files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    fetch(uploadEndpoint, { method: "POST", body: fd })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return (await r.json()) as { url: string };
      })
      .then((res) =>
        uploadHandler({
          result: [{ url: res.url, name: file.name, size: file.size }],
        })
      )
      .catch((e) =>
        uploadHandler({ errorMessage: e?.message || "Upload gagal" })
      );

    return undefined; // cegah upload default
  };

  return (
    <div className="rounded-lg border bg-background">
      <SunEditor
        setContents={value}
        defaultValue={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        setDefaultStyle={`
          body { 
            font-family: inherit; 
            font-size: 14px; 
            line-height: 1.7; 
            color: hsl(var(--foreground));
            background: transparent;
          }
          a { color: hsl(var(--primary)); text-decoration: underline; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid hsl(var(--border)); }
          th, td { padding: 6px 10px; }
        `}
        setOptions={{
          minHeight: `${minHeight}px`, // ⬅️ FIX: string
          maxHeight: "60vh",
          charCounter: true,
          showPathLabel: false,
          resizingBar: true,
          buttonList: buttons,
        }}
        onImageUploadBefore={onImageUploadBefore}
      />
    </div>
  );
}