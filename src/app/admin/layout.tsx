import { ReactNode } from "react";

export default function Layout({ children}:{ children:ReactNode }) {
  // For demo: very simple check via query ?as=ADMIN_EMAIL or set a cookie elsewhere.
  return <div className="max-w-6xl mx-auto p-6">{children}</div>;
}