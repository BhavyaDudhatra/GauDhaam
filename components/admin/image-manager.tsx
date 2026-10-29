"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { normalizeDriveLink } from "@/lib/googledrive";

export function ImageManager({
  value,
  onChange,
}: {
  value: string[];
  onChange: (images: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) {
          throw new Error(data.error || "Upload failed.");
        }
        onChange([...value, data.url]);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn btn-outline btn-sm"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {busy ? "Uploading…" : "Upload image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => upload(event.target.files)}
        />
        <div className="flex flex-1 min-w-[220px] gap-2">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://drive.google.com/…"
            className="input"
          />
          <button
            type="button"
            className="btn btn-outline btn-sm shrink-0"
            onClick={() => {
              const trimmed = url.trim();
              if (!trimmed) return;
              onChange([...value, normalizeDriveLink(trimmed)]);
              setUrl("");
            }}
          >
            <Link2 size={15} />
            Add link
          </button>
        </div>
      </div>

      {error && <p className="text-[12px] text-[#8A3E2C]">{error}</p>}

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-cream/50 px-4 py-6 text-center text-[12.5px] text-body/70">
          No images yet. Upload one or paste a Google Drive link.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <div className="relative aspect-square bg-light">
                <Image
                  src={normalizeDriveLink(src)}
                  alt={`Image ${index + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized
                />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    Main
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(index, -1)}
                    className="grid h-7 w-7 place-items-center rounded-md text-body/70 hover:bg-light"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(index, 1)}
                    className="grid h-7 w-7 place-items-center rounded-md text-body/70 hover:bg-light"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="grid h-7 w-7 place-items-center rounded-md text-brown hover:bg-light"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name="images" value={JSON.stringify(value)} />
    </div>
  );
}
