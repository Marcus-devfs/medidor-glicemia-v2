"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flag, Heart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { api } from "@/lib/api";
import { cn, formatDateBR } from "@/lib/utils";
import type { ForumComment, ForumPost } from "@/types";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get<{ post: ForumPost; comments: ForumComment[] }>(`/forum/posts/${id}`)
      .then(({ data }) => {
        setPost(data.post);
        setComments(data.comments);
      })
      .catch(() => router.push("/comunidade"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const toggleSupport = async () => {
    if (!post) return;
    const { data } = await api.post<{ likesCount: number; supported: boolean }>(
      `/forum/posts/${id}/support`
    );
    setPost({ ...post, likesCount: data.likesCount, supported: data.supported });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/forum/posts/${id}/comments`, { body: comment });
      setComment("");
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const reportPost = async () => {
    if (!confirm("Denunciar este post por conteúdo inadequado ou desinformação?")) return;
    await api.post(`/forum/posts/${id}/report`);
    alert("Denúncia enviada. Obrigada por ajudar a manter a comunidade segura.");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-sm text-gray-400 text-center">
        Carregando...
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="mx-auto max-w-lg">
      <Header title="Comunidade" />

      <main className="flex flex-col gap-4 px-4 pb-4">
        <Link
          href="/comunidade"
          className="inline-flex items-center gap-1 text-sm text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <Card>
          <span className="text-[10px] font-bold uppercase text-brand-500">{post.category}</span>
          <h1 className="mt-1 text-xl font-bold text-gray-900">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.body}
          </p>
          <p className="mt-4 text-xs text-gray-400">
            {post.userId?.name} · {formatDateBR(post.createdAt)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={toggleSupport}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                post.supported
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-600 hover:bg-brand-50"
              )}
            >
              <Heart className={cn("h-4 w-4", post.supported && "fill-brand-600")} />
              Apoiar ({post.likesCount})
            </button>
            <button
              onClick={reportPost}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-gray-400 hover:text-red-500"
            >
              <Flag className="h-3.5 w-3.5" />
              Denunciar
            </button>
          </div>
        </Card>

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Comentários ({comments.length})
          </h2>
          <div className="space-y-3">
            {comments.map((c) => (
              <Card key={c._id} className="py-3">
                <p className="text-sm text-gray-700">{c.body}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {c.userId?.name} · {formatDateBR(c.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={submitComment} className="space-y-3">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Escreva um comentário de apoio..."
            />
            <Button type="submit" fullWidth disabled={submitting} size="sm">
              {submitting ? "Enviando..." : "Comentar"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
