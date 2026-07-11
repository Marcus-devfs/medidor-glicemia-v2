"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { APP_NAME, APP_ICON } from "@/lib/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Link inválido. Solicite um novo e-mail de recuperação.");
      return;
    }

    if (password.length < 4) {
      setError("Senha deve ter no mínimo 4 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await api.post("/user/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { msg?: string } } };
      setError(axiosErr.response?.data?.msg ?? "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <Card className="text-center py-4">
        <p className="text-sm text-gray-600 mb-4">Link inválido ou incompleto.</p>
        <Link href="/recuperar-senha">
          <Button fullWidth>Solicitar novo link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      {success ? (
        <div className="flex flex-col items-center gap-4 text-center py-2">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-sm text-gray-600">
            Senha redefinida! Redirecionando para o login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-brand-100 px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src={APP_ICON} alt={APP_NAME} width={64} height={64} className="rounded-2xl" />
          <h1 className="text-xl font-bold text-gray-900">Nova senha</h1>
          <p className="text-sm text-gray-500">Escolha uma nova senha para sua conta.</p>
        </div>

        <Suspense fallback={<Card className="py-8 text-center text-sm text-gray-400">Carregando...</Card>}>
          <RedefinirSenhaForm />
        </Suspense>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
