"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "gestaglic_install_dismissed";
const IOS_DISMISS_KEY = "gestaglic_ios_install_dismissed";

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function usePwaInstall(forceInstall = false) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallReady(true);
      if (!localStorage.getItem(DISMISS_KEY)) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (forceInstall && isIosDevice()) {
      setShowIosModal(true);
    }

    if (forceInstall && !isIosDevice() && !localStorage.getItem(DISMISS_KEY)) {
      setShowBanner(true);
    }

    if (isIosDevice() && !forceInstall && !localStorage.getItem(IOS_DISMISS_KEY)) {
      const timer = setTimeout(() => setShowIosModal(true), 2000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [forceInstall]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
    return outcome === "accepted";
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowBanner(false);
  }, []);

  const dismissIosModal = useCallback(() => {
    localStorage.setItem(IOS_DISMISS_KEY, "1");
    setShowIosModal(false);
  }, []);

  return {
    showBanner: showBanner && !isStandalone() && (installReady || forceInstall),
    showIosModal: showIosModal && isIosDevice() && !isStandalone(),
    installReady,
    install,
    dismissBanner,
    dismissIosModal,
  };
}
