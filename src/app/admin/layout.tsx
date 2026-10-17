import { ReactNode } from "react";

export default function Layout({ children}:{ children:ReactNode }) {
  return <div className="max-w-6xl mx-auto p-6">{children}</div>;
}
