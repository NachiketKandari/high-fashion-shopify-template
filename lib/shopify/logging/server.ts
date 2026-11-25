import { type HydrogenLogger, type LogContext, configureLogging } from "@shopify/hydrogen";

import { logDebug, logError, logInfo, logWarn, serializeError } from "@/lib/observability/server";
import type { WritableLogLevel } from "@/lib/shopify/logging/types";

const DEBUG_SHOPIFY = ["1", "true"].includes(process.env.DEBUG_SHOPIFY?.toLowerCase() ?? "");

function writeLog(level: WritableLogLevel, message: string, context?: LogContext) {
  const { error, ...details } = context ?? {};
  const fields = { ...details, scope: "shopify" };

  if (error !== undefined) {
    logError(message, error, fields);
    return;
  }
  if (level === "debug" || level === "trace") {
    logDebug(message, fields);
    return;
  }
  if (level === "warn") {
    logWarn(message, fields);
    return;
  }
  logInfo(message, fields);
}

export const shopifyLogger: HydrogenLogger = {
  debug: (message, context) => writeLog("debug", message, context),
  error: (message, context) => writeLog("error", message, context),
  fatal: (message, context) => writeLog("error", message, context),
  info: (message, context) => writeLog("info", message, context),
  trace: (message, context) => writeLog("trace", message, context),
  warn: (message, context) => writeLog("warn", message, context),
};

export function configureShopifyLogging() {
  configureLogging({
    level: DEBUG_SHOPIFY ? "debug" : "info",
    logger: shopifyLogger,
  });
}

export function logShopifyDebug(message: string, context: LogContext) {
  if (DEBUG_SHOPIFY) shopifyLogger.debug(message, context);
}

export function logShopifyWarning(message: string, context: LogContext) {
  shopifyLogger.warn(message, context);
}
