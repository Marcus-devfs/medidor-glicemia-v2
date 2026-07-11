"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { LP_URL } from "@/lib/brand";
import { Card } from "@/components/ui/Card";
import type { ArticlePreview } from "@/types";

export function TipsFeed() {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);

  useEffect(() => {
    api
      .get<ArticlePreview[]>("/articles?limit=6")
      .then(({ data }) => setArticles(data))
      .catch(() => {});
  }, []);

  if (articles.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-gray-900">Dicas para você</h3>
        </div>
        <a
          href={`${LP_URL}/dicas`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-0.5 text-xs text-brand-600 font-medium"
        >
          Ver mais <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {articles.map((a) => (
          <a
            key={a._id}
            href={`${LP_URL}/dicas/${a.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-[220px] rounded-xl border border-brand-100 bg-brand-50/40 p-3 hover:bg-brand-50 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-brand-500">{a.category}</span>
            <p className="mt-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
              {a.title}
            </p>
            <p className="mt-1 text-[10px] text-gray-400">{a.readMinutes} min</p>
          </a>
        ))}
      </div>
    </Card>
  );
}
