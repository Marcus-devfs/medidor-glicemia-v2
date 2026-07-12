"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Baby, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SummaryCard } from "@/components/charts/SummaryCard";
import { GlucoseChart } from "@/components/charts/GlucoseChartLazy";
import { TipsFeed } from "@/components/TipsFeed";
import { CommunityFeed } from "@/components/CommunityFeed";
import { ReportPromoBanner } from "@/components/premium/ReportPromoBanner";
import { PremiumLimitBanner } from "@/components/premium/PremiumLimitBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useRegisterPageRefresh } from "@/contexts/RefreshContext";
import { api } from "@/lib/api";
import { calcAverage } from "@/lib/glucose";
import { FREE_PDF_LIMIT } from "@/lib/premium";
import { TARGET_INFO } from "@/lib/utils";
import type { Medicao } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const [medias, setMedias] = useState({ jejum: 0, apos: 0 });
  const [recent, setRecent] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
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
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  useRegisterPageRefresh(load);

  const pdfCount = user?.pdf_downloads_count ?? 0;
  const atPdfLimit = Boolean(user && !user.is_premium && pdfCount >= FREE_PDF_LIMIT);

  return (
    <div className="mx-auto max-w-lg">
      <Header subtitle="Cuide da sua saúde e do seu bebê" />

      <main className="flex flex-col gap-5 px-4 pb-4">
        {!user?.is_premium &&
          (atPdfLimit ? <PremiumLimitBanner /> : <ReportPromoBanner />)}

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

        <TipsFeed />

        <CommunityFeed />

        <RemindersCard />

        <p className="text-xs text-center text-gray-400 px-4 leading-relaxed">{TARGET_INFO}</p>
      </main>
    </div>
  );
}
