"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, MessageCircle, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRefreshSignal } from "@/contexts/RefreshContext";
import type { ForumPost } from "@/types";

export function CommunityFeed() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const refreshKey = useRefreshSignal();

  useEffect(() => {
    api
      .get<ForumPost[]>("/forum/posts")
      .then(({ data }) => setPosts(data.slice(0, 3)))
      .catch(() => {});
  }, [refreshKey]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-gray-900">Comunidade</h3>
        </div>
        <Link
          href="/comunidade"
          className="flex items-center gap-0.5 text-xs text-brand-600 font-medium"
        >
          Ver tudo <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Histórias e apoio de outras gestantes — compartilhe a sua também.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4 text-center">
          <p className="text-sm text-gray-600">Nenhum post ainda.</p>
          <Link href="/comunidade/novo" className="mt-3 inline-block">
            <Button size="sm" variant="secondary">
              Criar o primeiro post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/comunidade/${post._id}`}
              className="block rounded-xl border border-gray-100 bg-gray-50/80 p-3 hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase text-brand-500">
                {post.category}
              </span>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-1">
                {post.title}
              </p>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{post.body}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                <span>{post.userId?.name}</span>
                <span className="flex items-center gap-0.5">
                  <Heart className="h-3 w-3" /> {post.likesCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="h-3 w-3" /> {post.commentsCount}
                </span>
              </div>
            </Link>
          ))}
          <Link href="/comunidade/novo" className="block pt-1">
            <Button variant="ghost" size="sm" fullWidth className="text-brand-600">
              Compartilhar minha experiência
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
