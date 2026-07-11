"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail } from "lucide-react";
import { APP_NAME, APP_ICON } from "@/lib/brand";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/user/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-brand-100 px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src={APP_ICON} alt={APP_NAME} width={64} height={64} className="rounded-2xl" />
          <h1 className="text-xl font-bold text-gray-900">Esqueci minha senha</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>
        </div>

        <Card>
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                <Mail className="h-7 w-7 text-brand-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link em
                instantes. Verifique também a caixa de spam.
              </p>
              <Link href="/login">
                <Button variant="secondary" fullWidth>
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}
        </Card>

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
