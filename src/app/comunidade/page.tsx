"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Plus, Shield } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { ForumCategory, ForumPost } from "@/types";

const CATEGORIES: (ForumCategory | "Todas")[] = [
  "Todas",
  "Alimentação",
  "Ansiedade",
  "Sintomas",
  "Vitórias",
];

export default function ComunidadePage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [category, setCategory] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = category !== "Todas" ? `?category=${encodeURIComponent(category)}` : "";
    api
      .get<ForumPost[]>(`/forum/posts${params}`)
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="mx-auto max-w-lg">
      <Header subtitle="Troque experiências com outras gestantes" />

      <main className="flex flex-col gap-4 px-4 pb-4">
        <Card className="bg-brand-50/60 border-brand-100">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Este espaço é de apoio, não substitui orientação médica. Em dúvidas, fale com sua equipe de saúde.
            </p>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setLoading(true);
                setCategory(c);
              }}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                category === c
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <Link href="/comunidade/novo">
          <Button fullWidth>
            <Plus className="h-4 w-4" />
            Criar post
          </Button>
        </Link>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Nenhum post ainda. Seja a primeira a compartilhar!
          </p>
        ) : (
          posts.map((post) => (
            <Link key={post._id} href={`/comunidade/${post._id}`}>
              <Card className="hover:border-brand-200 transition-colors">
                <span className="text-[10px] font-bold uppercase text-brand-500">
                  {post.category}
                </span>
                <h2 className="mt-1 font-bold text-gray-900">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.body}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{post.userId?.name} · {formatDateBR(post.createdAt)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
