import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/context/app-context"
import { Toaster } from "sonner"
import { HardwareAcceleration } from "./hardware-acceleration"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          /* Critical CSS for fast transitions */
          * {
            transition-duration: 80ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }

          .card, [role="dialog"], [role="tabpanel"] {
            transition: transform 150ms, opacity 150ms;
          }
        `}</style>
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <HardwareAcceleration />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 2000
              }}
            />
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
