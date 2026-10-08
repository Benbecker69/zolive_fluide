import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontVariables } from "@/ui/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Zolive",
  description: "Huiles d'olive et épicerie fine.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
