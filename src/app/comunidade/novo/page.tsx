"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
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
            <div>
              <label className="text-xs font-semibold text-gray-500">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ForumCategory)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                placeholder="Ex: Consegui manter a glicemia estável hoje!"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">Texto</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                required
                rows={6}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none"
                placeholder="Conte sua experiência..."
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5"
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
