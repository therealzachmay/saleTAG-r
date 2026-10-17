import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="SaleTAGr admin", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // Fail closed if the admin credentials have not been configured.
  if (!expectedUsername || !expectedPassword) {
    return new NextResponse("Admin access is not configured", { status: 503 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Basic\s+(.+)$/i.exec(authorization);
  if (!match) return unauthorized();

  try {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(match[1]), (character) => character.charCodeAt(0)),
    );
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (username !== expectedUsername || password !== expectedPassword) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
