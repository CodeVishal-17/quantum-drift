import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "QubitWatch — Predictive Intelligence for Quantum Hardware",
  description:
    "Research demo: machine learning for predicting temporal noise drift in quantum computing systems. Next-record readout-error prediction from IBM Quantum calibration observations.",
  applicationName: "QubitWatch",
  keywords: ["quantum computing", "machine learning", "readout error", "calibration drift", "IBM Quantum"],
};

export const viewport: Viewport = {
  themeColor: "#060a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-midnight">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
