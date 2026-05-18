import ThemeRegistry from "@/components/theme-registry/theme-registry";
import { Box } from "@mui/material";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { CLERK_APPEARANCE_CONFIG, CLERK_LOCALIZATION_CONFIG } from "@/lib/clerk-config";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Ina Club B2B - פאנל ניהול עסקי",
  description: "פאנל ניהול לקבוצות פעילות",
  icons: { icon: "/InaclubAppLogo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={CLERK_APPEARANCE_CONFIG}
      localization={CLERK_LOCALIZATION_CONFIG}
      signUpUrl={undefined}
    >
      <ThemeRegistry>
        <html lang="he" dir="rtl" suppressHydrationWarning>
          <body
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              margin: 0,
            }}
          >
            <Box position="sticky" top={0} zIndex={1000}>
              <Header />
            </Box>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            <Analytics />
          </body>
        </html>
      </ThemeRegistry>
    </ClerkProvider>
  );
}
