import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ui/theme-provider"
import { Navbar } from "../components/ui/navbar-menu";
import { Toaster } from "@/components/ui/toaster"
import { getSession } from "@/app/api/auth/[...nextauth]/auth";
import Providers from "./providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finz",
  description: "Launchpad for tokenized contents for digital creators to earn perpetual revenue",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession()
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers session={session as any}>
                  <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
             <Navbar />
             <Toaster />
            {children}
          </ThemeProvider>
          </Providers>
        
      </body>
    </html>
  );
}
