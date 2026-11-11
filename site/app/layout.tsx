import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PageScroll } from "@site/components/page-scroll"
import { themeInitScript } from "@site/lib/theme"
import { SiteCommand } from "@site/components/site-command"
import { INDEXABLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@site/lib/seo"

export const metadata: Metadata = {
  title: { default: "Keyline UI · React components for dense interfaces", template: "%s · Keyline UI" },
  description: SITE_DESCRIPTION,
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  applicationName: SITE_NAME,
  // production only (lib/seo.ts): previews and local builds stay out of the index
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
}

export const viewport: Viewport = {
  // Keyline's paper (--kl-paper) in the light and dark themes
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f0f3" },
    { media: "(prefers-color-scheme: dark)", color: "#101215" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the theme class is set before paint by the script below, so the server's markup and the client's differ on <html> only
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SiteCommand>
          <PageScroll>{children}</PageScroll>
        </SiteCommand>
      </body>
    </html>
  )
}
