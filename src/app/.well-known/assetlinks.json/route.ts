import { NextResponse } from "next/server";

/**
 * Digital Asset Links so the Android app (TWA) opens full-screen with no browser bar.
 * Env: ANDROID_PACKAGE_NAME, ANDROID_SHA256_FINGERPRINTS (comma-separated; include the
 * Play App Signing key fingerprint from Play Console > Setup > App signing).
 */
export function GET() {
  const pkg = process.env.ANDROID_PACKAGE_NAME;
  const prints = (process.env.ANDROID_SHA256_FINGERPRINTS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const body = pkg && prints.length
    ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: prints } }]
    : [];
  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
