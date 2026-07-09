"use client";

import dynamic from "next/dynamic";

export const GlucoseChart = dynamic(
  () => import("./GlucoseChart").then((m) => m.GlucoseChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Carregando gráfico...
      </div>
    ),
  }
);
