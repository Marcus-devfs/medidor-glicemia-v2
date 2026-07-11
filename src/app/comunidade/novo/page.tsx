"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ForumCategory } from "@/types";

const CATEGORIES: ForumCategory[] = [
  "Alimentação",
  "Ansiedade",
  "Sintomas",
  "Vitórias",
];

export default function NovoPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ForumCategory>("Vitórias");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError("Confirme que leu o aviso sobre conteúdo de saúde.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/forum/posts", { title, body, category });
      router.push(`/comunidade/${data._id}`);
    } catch {
      setError("Não foi possível publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Header title="Novo post" subtitle="Compartilhe com a comunidade" />

      <main className="px-4 pb-4">
        <Link
          href="/comunidade"
          className="inline-flex items-center gap-1 text-sm text-brand-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <Card>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all",
                      category === c
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              placeholder="Ex: Consegui manter a glicemia estável hoje!"
            />

            <Textarea
              label="Texto"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              required
              rows={6}
              placeholder="Conte sua experiência..."
            />

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
              />
              Entendo que este espaço não substitui orientação médica e que desinformação pode ser prejudicial.
            </label>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
