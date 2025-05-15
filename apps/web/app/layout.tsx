import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from '@/components/query-provider';
import { Geist_Mono, Inter, Noto_Sans, Nunito_Sans, Open_Sans, Raleway } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { TopProgressBar } from "@/components/top-progress-bar";
import { Suspense } from "react";
import { Posthog } from "@/components/posthog";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
})

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: 'AI assistant made by Carlos Nexans',
  robots: "noindex, noffollow"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${inter.variable} ${notoSans.variable} ${raleway.variable} ${nunito.variable} ${openSans.variable}`}>
      <body
        className="font-sans antialiased"
        id="root"
      >
        <ClerkProvider>
        <Posthog>
        <QueryProvider>
          <Suspense>
            <TopProgressBar />
          </Suspense>
              {children}
        </QueryProvider>
        <Toaster />
        </Posthog>
        </ClerkProvider>
      </body>
    </html>
  );
}
