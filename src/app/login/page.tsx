"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME, APP_ICON, LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/lib/brand";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { markOnboardingPending } from "@/lib/onboarding";

export default function LoginPage() {
  const { login, register, toast } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    telephone: "",
  });
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    healthData: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const ok = await login({ email: form.email, password: form.password });
      if (!ok) toast("E-mail ou senha incorretos", "error");
    } else {
      if (!form.name || !form.email || !form.password) {
        toast("Preencha todos os campos", "error");
        setLoading(false);
        return;
      }
      if (!consents.terms || !consents.privacy || !consents.healthData) {
        toast("Aceite os termos e o tratamento de dados de saúde para continuar", "error");
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        toast("A senha deve ter pelo menos 6 caracteres", "error");
        setLoading(false);
        return;
      }
      const ok = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        telephone: form.telephone,
        acceptedTerms: true,
        acceptedPrivacy: true,
        acceptedHealthData: true,
      });
      if (ok) {
        markOnboardingPending();
        const loggedIn = await login({ email: form.email, password: form.password });
        if (loggedIn) {
          toast("Conta criada! Bem-vinda ao GestaGlic 💗", "success");
        } else {
          toast("Conta criada! Faça login para continuar.", "success");
          setMode("login");
        }
      } else {
        toast("Erro ao criar conta. E-mail já cadastrado?", "error");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-brand-100 px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 shadow-lg">
            <Image
              src={APP_ICON}
              alt={APP_NAME}
              width={80}
              height={80}
              className="rounded-2xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Controle sua glicemia durante a gestação com carinho e praticidade 💗
          </p>
        </div>

        <Card>
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                  mode === m ? "bg-white text-brand-700 shadow-sm" : "text-gray-500"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Input
                label="Nome completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                required
              />
            )}
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
              required
            />
            {mode === "login" && (
              <div className="text-right -mt-2">
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>
            )}
            {mode === "register" && (
              <>
                <Input
                  label="Telefone (opcional)"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
                <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consents.terms && consents.privacy}
                      onChange={(e) =>
                        setConsents((c) => ({
                          ...c,
                          terms: e.target.checked,
                          privacy: e.target.checked,
                        }))
                      }
                      className="mt-0.5 rounded border-gray-300 text-brand-600"
                    />
                    <span>
                      Li e aceito os{" "}
                      <a
                        href={LEGAL_TERMS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 font-medium hover:underline"
                      >
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a
                        href={LEGAL_PRIVACY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 font-medium hover:underline"
                      >
                        Política de Privacidade
                      </a>
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consents.healthData}
                      onChange={(e) =>
                        setConsents((c) => ({ ...c, healthData: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-gray-300 text-brand-600"
                    />
                    <span>
                      Autorizo o tratamento dos meus <strong>dados de saúde</strong> (glicemia e
                      informações da gestação) para controle do diabetes gestacional, conforme a
                      LGPD.
                    </span>
                  </label>
                </div>
              </>
            )}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </Card>

        <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
          <Heart className="h-3 w-3 text-brand-400 fill-brand-400" />
          <span>Feito para gestantes com diabetes gestacional</span>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={LEGAL_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
              Privacidade
            </a>
            <a href={LEGAL_TERMS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">
              Termos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
