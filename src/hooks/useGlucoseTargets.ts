"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { resolveGlucoseTargets } from "@/lib/glucose";

export function useGlucoseTargets() {
  const { user } = useAuth();
  return useMemo(() => resolveGlucoseTargets(user?.glucoseTargets), [user?.glucoseTargets]);
}
