import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PredictAI — Predictive Maintenance Assistant",
  description:
    "AI-powered industrial maintenance assistant that converts raw machine sensor data into clear, actionable diagnostics. Prevent failures before they happen.",
  keywords: [
    "predictive maintenance",
    "AI diagnostics",
    "industrial IoT",
    "machine health",
    "anomaly detection",
  ],
  openGraph: {
    title: "PredictAI — Predictive Maintenance Assistant",
    description:
      "Convert complex machine data into clear, actionable decisions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#040813" />
      </head>
      <body>{children}</body>
    </html>
  );
}
