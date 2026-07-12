"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { User } from "@/types";

/** Trata retorno do checkout Asaas (?premium=success|cancel|expired) */
export function PremiumReturnHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, updateUser, toast } = useAuth();

  useEffect(() => {
    const status = searchParams.get("premium");
    if (!status || !user?._id) return;

    const clearParam = () => router.replace("/relatorio", { scroll: false });

    if (status === "success") {
      api
        .get<User>(`/user/${user._id}`)
        .then(({ data }) => {
          updateUser(data);
          if (data.is_premium) {
            toast("Kit Consulta Premium ativado! 💗", "success");
          } else {
            toast(
              "Pagamento recebido! Se o premium não liberar em 1 min, atualize a página.",
              "info"
            );
          }
        })
        .catch(() => {
          toast("Volte em instantes — estamos confirmando seu pagamento.", "info");
        })
        .finally(clearParam);
      return;
    }

    if (status === "cancel") {
      toast("Pagamento cancelado. Seus PDFs gratuitos já foram utilizados.", "info");
      clearParam();
      return;
    }

    if (status === "expired") {
      toast("O link de pagamento expirou. Tente exportar o PDF novamente.", "info");
      clearParam();
    }
  }, [searchParams, user?._id, updateUser, toast, router]);

  return null;
}
