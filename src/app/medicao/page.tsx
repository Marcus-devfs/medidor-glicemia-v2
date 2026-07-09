"use client";

import { Header } from "@/components/layout/Header";
import { MeasureForm } from "@/components/measure/MeasureForm";
import { Card } from "@/components/ui/Card";

export default function MedicaoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Header title="Nova medição" subtitle="Registre sua glicemia" />
      <main className="px-4 pb-6">
        <Card className="shadow-card-lg border-gray-100 p-5 sm:p-6">
          <MeasureForm />
        </Card>
      </main>
    </div>
  );
}
