"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Baby, Bell, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { calcAverage } from "@/lib/glucose";
import { TARGET_INFO } from "@/lib/utils";
import type { Medicao } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const [medias, setMedias] = useState({ jejum: 0, apos: 0 });
  const [recent, setRecent] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?._id) return;
      try {
        const [mediaRes, listRes] = await Promise.all([
          api.get(`/marking/list/media/${user._id}?year=todos`),
          api.get<Medicao[]>(`/marking/list/${user._id}`),
        ]);
        const { jejum, aposLanch } = mediaRes.data;
        setMedias({
          jejum: calcAverage(jejum.map((m: Medicao) => m.value)),
          apos: calcAverage(aposLanch.map((m: Medicao) => m.value)),
        });
        setRecent(
          [...listRes.data]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
        );
      } catch {
        // silently fail on home
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?._id]);

  return (
    <div className="mx-auto max-w-lg">
      <Header subtitle="Cuide da sua saúde e do seu bebê" />

      <main className="flex flex-col gap-5 px-4 pb-4">
        <Card className="bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0">
          <div className="flex items-start gap-3">
            <Baby className="h-8 w-8 shrink-0 opacity-90" />
            <div>
              <h2 className="font-bold text-lg">Diabetes Gestacional</h2>
              <p className="text-sm text-brand-100 mt-1 leading-relaxed">
                Registrar suas medições regularmente ajuda você e seu médico a manter tudo sob controle durante a gestação.
              </p>
            </div>
          </div>
          <Link href="/medicao" className="mt-4 block">
            <Button variant="secondary" fullWidth className="bg-white text-brand-700 hover:bg-brand-50">
              Fazer medição agora
            </Button>
          </Link>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Média Jejum" value={medias.jejum} period="Jejum" icon="🌅" />
          <SummaryCard label="Média Pós-refeição" value={medias.apos} period="Após Café" icon="🍽️" />
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Evolução recente</h3>
            <Link href="/relatorio" className="flex items-center gap-1 text-sm text-brand-600 font-medium">
              Ver mais <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <GlucoseChart data={recent} />
          )}
        </Card>

        <Card className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Lembretes ativos</p>
            <p className="text-xs text-gray-500 mt-1">
              Você receberá notificações nos horários configurados para medir a glicemia. Configure em Perfil.
            </p>
          </div>
        </Card>

        <p className="text-xs text-center text-gray-400 px-4 leading-relaxed">{TARGET_INFO}</p>
      </main>
    </div>
  );
}
