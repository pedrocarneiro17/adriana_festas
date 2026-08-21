"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash2, ImagePlus } from "lucide-react";
import { excluirReferencia } from "@/lib/actions/referencias";

type Referencia = { id: string; nomeArquivo: string };

export default function ReferenciasEvento({
  eventoId,
  referencias,
  readOnly,
}: {
  eventoId: string;
  referencias: Referencia[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("arquivos", file);

    setIsUploading(true);
    try {
      await fetch(`/api/eventos/${eventoId}/referencias`, { method: "POST", body: formData });
      router.refresh();
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleExcluir(id: string) {
    if (!window.confirm("Excluir esta imagem de referência?")) return;
    startTransition(() => excluirReferencia(id));
  }

  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" /> {isUploading ? "Enviando..." : "Adicionar fotos"}
          </Button>
        </div>
      )}

      {referencias.length === 0 ? (
        <p className="text-sm text-sand-500">Nenhuma referência anexada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {referencias.map((r) => (
            <div
              key={r.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-divider)] bg-[var(--color-surface)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem de bytes salvos no banco, sem otimização de asset estático */}
              <img src={`/api/referencias/${r.id}`} alt={r.nomeArquivo} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={`/api/referencias/${r.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sand-900 hover:bg-white"
                  title="Ver"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <a
                  href={`/api/referencias/${r.id}?download`}
                  download={r.nomeArquivo}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sand-900 hover:bg-white"
                  title="Baixar"
                >
                  <Download className="h-4 w-4" />
                </a>
                {!readOnly && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleExcluir(r.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-700 hover:bg-white"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
