"use client";

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useSyncExternalStore } from "react";

import { shopConfig } from "@/lib/config";
import { CONSENT_EVENT, readConsent, type ConsentChoice } from "@/lib/consent";

interface ConsentAwareAnalyticsProps {
  gaMeasurementId?: string;
  gtmId?: string;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

function getSnapshot(): ConsentChoice | null {
  return readConsent();
}

function getServerSnapshot(): ConsentChoice | null {
  return null;
}

export function ConsentAwareAnalytics({ gaMeasurementId, gtmId }: ConsentAwareAnalyticsProps) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (consent !== "all") return null;

  return (
    <>
      {shopConfig.analytics.vercel.isEnabled && <Analytics />}
      {shopConfig.analytics.speedInsights.isEnabled && <SpeedInsights />}
      {/* GTM owns the GA4 page view when configured; the direct tag would double-count it. */}
      {gtmId ? (
        <GoogleTagManager gtmId={gtmId} />
      ) : gaMeasurementId ? (
        <GoogleAnalytics gaId={gaMeasurementId} />
      ) : null}
    </>
  );
}
