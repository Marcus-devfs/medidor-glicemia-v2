"use client";

import { usePathname } from "next/navigation";
import { usePwaInstall } from "./usePwaInstall";
import { InstallBanner } from "./InstallBanner";
import { IosInstallModal } from "./IosInstallModal";

export function PwaInstallProvider() {
  const pathname = usePathname();
  const {
    showBanner,
    showIosModal,
    install,
    dismissBanner,
    dismissIosModal,
  } = usePwaInstall();

  if (pathname === "/login") return null;

  return (
    <>
      {showBanner && (
        <InstallBanner
          onInstall={install}
          onDismiss={dismissBanner}
        />
      )}
      <IosInstallModal open={showIosModal} onClose={dismissIosModal} />
    </>
  );
}
