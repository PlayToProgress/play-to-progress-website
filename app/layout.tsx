import type { Metadata, Viewport } from "next";
// stubbed
import "./globals.css";
import Providers from "./providers";
import ServiceWorkerRegister from "./sw-register";

const inter = { variable: "" };
const barlowCondensed = { variable: "" };

export const metadata: Metadata = {
  title: "Play to Progress | Profit + Play",
  description:
    "Play to Progress — free digital gaming and creative coding workshops for young people aged 11-18 in Newham, delivered by Profit + Play.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
