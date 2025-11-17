// A thin wrapper around Google Play Billing plugins for Capacitor.
// First tries the 'capacitor-billing' plugin (actively maintained),
// then falls back to common global plugin names for broader compatibility.

export type PurchaseResult = {
  productId: string;
  purchaseToken: string;
  raw?: any;
};

async function getBilling(): Promise<{
  type: "capacitor-billing" | "global";
  plugin: any;
} | null> {
  // Try to import the recommended plugin first
  try {
    const mod = await import("capacitor-billing");
    if (mod?.BillingPlugin) {
      return { type: "capacitor-billing", plugin: mod.BillingPlugin };
    }
  } catch (_) {
    // ignore dynamic import errors
  }

  // Fallback to global plugin references
  const w: any = typeof window !== "undefined" ? window : undefined;
  const globalPlugin =
    w?.Capacitor?.Plugins?.PlayBilling ||
    w?.Capacitor?.Plugins?.GooglePlayBilling ||
    w?.PlayBilling ||
    w?.GooglePlayBilling ||
    null;
  if (globalPlugin) {
    return { type: "global", plugin: globalPlugin };
  }
  return null;
}

export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  const billingWrap = await getBilling();
  if (!billingWrap) {
    throw new Error("Google Play Billing plugin not available in Capacitor runtime");
  }
  const { type, plugin } = billingWrap;

  let res: any = null;
  let lastErr: any = null;

  if (type === "capacitor-billing") {
    // Preferred path using 'capacitor-billing' API
    try {
      // Attempt INAPP first, then SUBS as fallback
      res = await plugin.launchBillingFlow({ product: productId, type: "INAPP" });
    } catch (e1) {
      lastErr = e1;
      try {
        res = await plugin.launchBillingFlow({ product: productId, type: "SUBS" });
      } catch (e2) {
        lastErr = e2;
      }
    }
  } else {
    // Fallback signatures across various community plugins
    const candidates: Array<() => Promise<any>> = [
      () => plugin.purchase?.({ productId }),
      () => plugin.purchase?.({ sku: productId }),
      () => plugin.requestPayment?.({ sku: productId }),
    ].filter(Boolean) as any;

    for (const fn of candidates) {
      try {
        res = await fn();
        if (res) break;
      } catch (e) {
        lastErr = e;
      }
    }
  }

  if (!res) {
    throw lastErr || new Error("Failed to perform purchase: no compatible method found");
  }

  // Normalize result fields
  const purchaseToken =
    res?.purchaseToken ||
    res?.token ||
    res?.purchase?.purchaseToken ||
    res?.purchaseTokenAndroid ||
    res?.purchaseToken?.value || // Some plugins wrap result fields
    res?.transactionInfo?.purchaseToken;

  if (!purchaseToken) {
    throw new Error("Purchase completed but purchaseToken not found in plugin response");
  }
  return { productId, purchaseToken, raw: res };
}