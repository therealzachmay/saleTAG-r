import { createSign, createHash } from "crypto";

/**
 * Minimal server-side Google Play Developer API client (no extra deps).
 * Requires env:
 *   ANDROID_PACKAGE_NAME                 e.g. com.therealzachmay.saletagr
 *   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON     full JSON key of a service account invited in Play Console
 *                                        (Users and permissions) with "View financial data" + "Manage orders".
 */

type ServiceAccount = { client_email: string; private_key: string };

let cachedToken: { token: string; exp: number } | null = null;

function serviceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Server misconfigured: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON missing");
  const sa = JSON.parse(raw) as ServiceAccount;
  return { client_email: sa.client_email, private_key: sa.private_key.replace(/\\n/g, "\n") };
}

export function packageName(): string {
  const p = process.env.ANDROID_PACKAGE_NAME;
  if (!p) throw new Error("Server misconfigured: ANDROID_PACKAGE_NAME missing");
  return p;
}

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const sa = serviceAccount();
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(sa.private_key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Google auth failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

export type ProductPurchase = {
  purchaseState?: number; // 0 purchased, 1 canceled, 2 pending
  consumptionState?: number; // 0 not consumed, 1 consumed
  acknowledgementState?: number;
  orderId?: string;
  productId?: string;
  quantity?: number;
};

const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

export async function getProductPurchase(productId: string, token: string): Promise<ProductPurchase> {
  const url = `${API}/${encodeURIComponent(packageName())}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok) throw new Error(`Purchase lookup failed (${res.status})`);
  return (await res.json()) as ProductPurchase;
}

/** Consumes a one-time product so the user can buy it again (also acknowledges it). */
export async function consumeProduct(productId: string, token: string): Promise<void> {
  const url = `${API}/${encodeURIComponent(packageName())}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}:consume`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok && res.status !== 400) throw new Error(`Consume failed (${res.status})`);
}

export function tokenKey(token: string) {
  return "play:" + createHash("sha256").update(token).digest("hex").slice(0, 40);
}
