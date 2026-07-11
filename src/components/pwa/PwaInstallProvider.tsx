"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePwaInstall } from "./usePwaInstall";
import { InstallBanner } from "./InstallBanner";
import { IosInstallModal } from "./IosInstallModal";

function PwaInstallInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const forceInstall = searchParams.get("install") === "1";

  const {
    showBanner,
    showIosModal,
    installReady,
    install,
    dismissBanner,
    dismissIosModal,
  } = usePwaInstall(forceInstall);

  if (pathname === "/login" && !forceInstall) return null;

  return (
    <>
      {showBanner && (
        <InstallBanner
          onInstall={install}
          onDismiss={dismissBanner}
          installReady={installReady}
        />
      )}
      <IosInstallModal open={showIosModal} onClose={dismissIosModal} />
    </>
  );
}

export function PwaInstallProvider() {
  return (
    <Suspense fallback={null}>
      <PwaInstallInner />
    </Suspense>
  );
}
